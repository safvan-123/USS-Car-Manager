// All arithmetic is in integer paise. Presentation never changes stored money.
export function paise(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || Math.abs(n) > 1e9) throw new Error('Invalid money value');
  return Math.round((n + Math.sign(n) * Number.EPSILON) * 100);
}
export function sumMoney(values) { return values.reduce((sum, value) => sum + paise(value), 0) / 100; }
export function subtractMoney(a, b) { return (paise(a) - paise(b)) / 100; }
export function expenseTotal(record) { return record.totalAmount ?? record.amount ?? 0; }
const SCALE = 1e12;
export function completeShares(partners) {
  try {
    const total = partners.reduce((sum, p) => sum + BigInt(Math.round(Number(p.sharePercentage) * SCALE)), 0n);
    return partners.length > 0 && total >= 100000000000000n - 10000n && total <= 100000000000000n + 10000n && partners.every(p => Number(p.sharePercentage) > 0);
  } catch { return false; }
}
// Mirrors the supplied backend's largest-remainder algorithm and ID tie-break.
export function splitAmount(value, partners) {
  if (!partners.length) return [];
  if (!completeShares(partners)) throw new Error('Partner shares must total 100%.');
  const total = paise(value);
  if (total < 0) throw new Error('Amount cannot be negative');
  const rows = partners.map(p => ({ partnerId: String(p._id ?? p.partnerId), name: p.name, sharePercentage: Number(p.sharePercentage), units: BigInt(Math.round(Number(p.sharePercentage) * SCALE)) }));
  const denominator = rows.reduce((s, p) => s + p.units, 0n);
  const result = rows.map(p => { const product = BigInt(total) * p.units; return { ...p, cents: Number(product / denominator), remainder: product % denominator }; });
  const remaining = total - result.reduce((s, p) => s + p.cents, 0);
  const ordered = [...result].sort((a, b) => a.remainder === b.remainder ? a.partnerId.localeCompare(b.partnerId) : a.remainder > b.remainder ? -1 : 1);
  for (let i = 0; i < remaining; i++) ordered[i].cents++;
  return result.map(p => ({ partnerId: p.partnerId, name: p.name, sharePercentage: p.sharePercentage, amount: p.cents / 100, paidAmount: 0 }));
}
export function validateSummary(data) {
  if (!data || !data.totals || !Array.isArray(data.partners) || !Array.isArray(data.monthly)) throw new Error('The API returned an unsupported report. Check that the supplied v2 backend is deployed.');
  for (const key of ['earnings', 'expenses', 'legacyIncome', 'recordedSurplus']) {
    if (data.totals[key] == null || !Number.isFinite(Number(data.totals[key]))) throw new Error(`The API report is missing ${key}. Refresh or check the backend deployment.`);
  }
  const expected = sumMoney([data.totals.earnings, data.totals.legacyIncome, -Number(data.totals.expenses)]);
  if (paise(expected) !== paise(data.totals.recordedSurplus)) throw new Error('API totals do not reconcile. Review the backend report before using these figures.');
  return data;
}
