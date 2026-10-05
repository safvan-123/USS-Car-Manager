class AppError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (message, status = 400) => { throw new AppError(status, message); };
function object(value, label = 'Body') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must be an object`);
  return value;
}
function text(value, label, max = 200, required = false) {
  if (typeof value !== 'string') fail(`${label} must be text`);
  const result = value.trim();
  if (result.length > max || (required && !result)) fail(`${label} is required and must be at most ${max} characters`);
  return result;
}
function id(value, label = 'ID') {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) fail(`Invalid ${label}`);
  return value.toLowerCase();
}
function date(value, label = 'Date') {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) fail(`${label} must be an ISO date`);
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value.slice(0, 10)) fail(`Invalid ${label}`);
  return parsed;
}
function enumeration(value, choices, label) {
  if (!choices.includes(value)) fail(`${label} must be one of: ${choices.join(', ')}`);
  return value;
}
function boolean(value, label) {
  if (typeof value !== 'boolean') fail(`${label} must be true or false`);
  return value;
}
function integer(value, min, max, label) {
  if (!['string', 'number'].includes(typeof value) || String(value).trim() === '') fail(`Invalid ${label}`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > max) fail(`${label} must be between ${min} and ${max}`);
  return n;
}
// Parse decimals through strings; do not split currency using floating point multiplication.
function cents(value, label = 'Amount', allowZero = true) {
  if (!['string', 'number'].includes(typeof value)) fail(`${label} must be a decimal amount`);
  const s = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(s)) fail(`${label} must be non-negative with at most two decimals`);
  const [whole, fraction = ''] = s.split('.');
  const n = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(n) || n > 100000000000 || (!allowZero && n === 0)) fail(`${label} is outside the supported range`);
  return n;
}
const rupees = n => n / 100;
function percentage(value) {
  if (!['string', 'number'].includes(typeof value) || String(value).trim() === '') fail('Share percentage must be numeric');
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 100) fail('Share percentage must be greater than 0 and at most 100');
  return n;
}
const numberPlate = value => {
  const n = text(value, 'Car number', 30, true).toUpperCase().replace(/[\s-]/g, '');
  if (!/^[A-Z0-9]{5,20}$/.test(n)) fail('Car number must contain 5–20 letters or digits');
  return n;
};
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
module.exports = { AppError, fail, object, text, id, date, enumeration, boolean, integer, cents, rupees, percentage, numberPlate, escapeRegex };
