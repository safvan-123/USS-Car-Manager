const v = require('./validation');
const { expenseTotal } = require('./legacy');
function reportMoney(value) {
  if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') v.fail('Invalid historical amount. Run the data audit.', 409);
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 1000000000) v.fail('Invalid historical amount. Run the data audit and correct the record.', 409);
  return Math.round(n * 100); // read-only display rounding for legacy fractional values
}
function buildSummary(data) {
  const names = new Map(data.partners.map(p => [String(p._id), p.name]));
  const partners = new Map(), months = new Map();
  const carIds = new Set((data.cars || []).map(car => String(car._id)));
  const orphanedRecords = [], allocationDifferences = [];
  const orphanedTotals = { earnings: 0, legacyIncome: 0, expenses: 0 };
  let legacyAmountRecords = 0;
  const total = { earnings: 0, legacyIncome: 0, expenses: 0, unallocatedEarnings: 0, unallocatedExpenses: 0, unallocatedLegacyIncome: 0 };
  let legacyRounding = false;
  const amount = n => { const c = reportMoney(n); if (Math.abs(c / 100 - Number(n)) > 0.0000001) legacyRounding = true; return c; };
  for (const [records, category, amountKey] of [[data.earnings, 'earnings', 'amount'], [data.expenses, 'expenses', 'totalAmount']]) {
    for (const record of records) {
      const key = category === 'expenses' && record.type === 'income' ? 'legacyIncome' : category;
      const value = amount(category === 'expenses' ? expenseTotal(record) : record.amount); total[key] += value;
      if (category === 'expenses' && record.totalAmount == null && record.amount != null) legacyAmountRecords++;
      if (!carIds.has(String(record.car))) {
        orphanedRecords.push({ entity: category === 'expenses' ? 'Expense' : 'Earning', id: String(record._id), carId: String(record.car), amount: v.rupees(value) });
        orphanedTotals[key] += value;
      }
      const parsedDate = record.date == null ? null : new Date(record.date);
      const month = parsedDate && Number.isFinite(parsedDate.getTime()) ? parsedDate.toISOString().slice(0, 7) : 'Unknown date';
      if (!months.has(month)) months.set(month, { month, earnings: 0, expenses: 0, legacyIncome: 0 });
      months.get(month)[key] += value;
      let assigned = 0;
      for (const allocation of record.partners || []) {
        const partnerId = String(allocation.partnerId), allocated = amount(allocation.amount);
        const paid = allocation.paidAmount != null ? amount(allocation.paidAmount) : allocation.paid ? allocated : 0;
        assigned += allocated;
        if (!partners.has(partnerId)) partners.set(partnerId, { partnerId, name: names.get(partnerId) || 'Missing partner', earningsAllocated: 0, earningsReceived: 0, expensesAllocated: 0, expensesContributed: 0, legacyIncomeAllocated: 0, legacyIncomeReceived: 0 });
        const row = partners.get(partnerId);
        row[`${key}Allocated`] += allocated;
        row[key === 'expenses' ? 'expensesContributed' : `${key}Received`] += paid;
      }
      total[`unallocated${key[0].toUpperCase()}${key.slice(1)}`] += value - assigned;
      if (value !== assigned) allocationDifferences.push({ entity: category === 'expenses' ? 'Expense' : 'Earning', id: String(record._id), difference: v.rupees(value - assigned) });
    }
  }
  const convert = row => Object.fromEntries(Object.entries(row).map(([k, value]) => [k, typeof value === 'number' ? v.rupees(value) : value]));
  return {
    totals: { ...convert(total), recordedSurplus: v.rupees(total.earnings + total.legacyIncome - total.expenses) },
    partners: [...partners.values()].map(row => convert({ ...row, earningsOutstanding: row.earningsAllocated - row.earningsReceived, expensesOutstanding: row.expensesAllocated - row.expensesContributed, legacyIncomeOutstanding: row.legacyIncomeAllocated - row.legacyIncomeReceived })),
    monthly: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)).map(convert),
    orphanedRecords,
    orphanedTotals: convert(orphanedTotals),
    allocationDifferences,
    legacyAmountRecords,
    warnings: [
      ...(orphanedRecords.length ? ['Totals INCLUDE retained records whose cars are missing; see orphanedTotals (a subset, not additional income/expense).'] : []),
      ...(legacyAmountRecords ? ['Older expenses were read from amount where totalAmount is absent; stored data was not changed.'] : []),
      ...(months.has('Unknown date') ? ['Some records have no usable date and are grouped under Unknown date.'] : []),
      ...(total.legacyIncome ? ['Legacy income stored in Expense is included separately. Confirm it is not duplicated in Earnings.'] : []),
      ...(legacyRounding ? ['Historical fractional amounts were rounded for display only. Run npm run audit-data; no database amounts were changed.'] : []),
      ...(allocationDifferences.length ? ['Some allocations do not match transaction totals; review the data audit.'] : [])
    ],
    note: 'Recorded surplus is income entries minus expense entries, not audited profit or cash balance. Partner payments represent distribution/contribution, not customer payment collection.'
  };
}
module.exports = buildSummary;
