const { randomBytes, scrypt, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');
const derive = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await derive(password, salt, 64)).toString('hex')}`;
}
async function verifyPassword(password, hash) {
  const [salt, stored] = hash.split(':');
  const actual = await derive(password, salt, 64), expected = Buffer.from(stored, 'hex');
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
const tokenHash = value => createHash('sha256').update(value).digest('hex');
module.exports = { hashPassword, verifyPassword, tokenHash };
