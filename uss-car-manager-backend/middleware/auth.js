const Session = require('../models/Session');
const { tokenHash } = require('../utils/password');
const { fail } = require('../utils/validation');
async function requireAuth(req, res, next) {
  const match = /^Bearer ([a-f\d]{64})$/i.exec(req.get('Authorization') || '');
  if (!match) fail('Please log in', 401);
  const session = await Session.findOne({ tokenHash: tokenHash(match[1]), expiresAt: { $gt: new Date() } }).populate('user');
  if (!session?.user?.active) fail('Session expired or account disabled', 401);
  req.user = session.user; req.authSession = session;
  next();
}
const roles = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user.role)) fail('You do not have permission for this action', 403);
  next();
};
module.exports = { requireAuth, roles };
