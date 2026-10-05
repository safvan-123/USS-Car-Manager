const { percentage, fail } = require('./validation');
// Precision for calculation only; stored ownership percentages are not rewritten.
const SCALE = 1000000000000n;
const FULL = 100n * SCALE;
const TOLERANCE = 10000n; // 0.00000001 percentage points, not 0.01%
function weight(value) {
  const result = BigInt(Math.round(percentage(value) * Number(SCALE)));
  if (result <= 0n) fail('Share percentage is too small to allocate');
  return result;
}
function sumWeights(values) { return values.reduce((sum, value) => sum + weight(value), 0n); }
function complete(total) { return total >= FULL - TOLERANCE && total <= FULL + TOLERANCE; }
module.exports = { SCALE, FULL, TOLERANCE, weight, sumWeights, complete };
