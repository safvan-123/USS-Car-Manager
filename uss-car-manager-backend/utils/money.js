const { cents, rupees, fail } = require('./validation');
const shares = require('./shares');
function splitAmount(amount, partners) {
  const total = cents(amount, 'Total', false);
  const rows = partners.map(p => ({ partnerId: String(p._id), percentage: Number(p.sharePercentage), units: shares.weight(p.sharePercentage) }));
  const denominator = rows.reduce((sum, row) => sum + row.units, 0n);
  if (!rows.length || !shares.complete(denominator)) {
    fail('Active partner percentages must total 100% (allowing only tiny numeric precision differences) for automatic allocation');
  }
  // Largest-remainder allocation with a stable partner-ID tie break.
  const result = rows.map(r => {
    const product = BigInt(total) * BigInt(r.units);
    return { ...r, value: Number(product / denominator), remainder: product % denominator };
  });
  let remaining = total - result.reduce((s, r) => s + r.value, 0);
  const order = [...result].sort((a, b) => a.remainder === b.remainder ? a.partnerId.localeCompare(b.partnerId) : a.remainder > b.remainder ? -1 : 1);
  for (let i = 0; i < remaining; i++) order[i].value++;
  return result.map(r => ({ partnerId: r.partnerId, sharePercentage: r.percentage, amount: rupees(r.value), paidAmount: 0, paid: false }));
}
function paidCents(row) {
  return row.paidAmount != null ? cents(row.paidAmount, 'Paid amount') : (row.paid ? cents(row.amount) : 0);
}
function normalisePayment(row, previous, allowReduction = false) {
  const allocated = cents(row.amount);
  let paid = previous ? paidCents(previous) : 0;
  if (row.paidAmount !== undefined) paid = cents(row.paidAmount, 'Paid amount');
  else if (row.paid !== undefined) {
    if (typeof row.paid !== 'boolean') fail('Paid must be true or false');
    paid = row.paid ? allocated : 0;
  }
  if (paid > allocated) fail('Paid amount cannot exceed the partner allocation');
  if (previous && !allowReduction && paid < paidCents(previous)) fail('Recorded payments cannot be reduced here. Ask an admin to use the payment correction endpoint.', 409);
  return { ...row, paidAmount: rupees(paid), paid: allocated === paid };
}
module.exports = { splitAmount, paidCents, normalisePayment };
