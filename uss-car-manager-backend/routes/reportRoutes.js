const router = require('express').Router();
const c = require('../controllers/reportController');
const { roles } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');
const v = require('../utils/validation');
router.get('/summary', c.summary);
router.get('/reminders', c.reminders);
router.get('/transactions.csv', c.exportCsv);
router.get('/audit', roles('admin'), async (req, res) => {
  const filter = {};
  if (req.query.entity) filter.entity = v.enumeration(req.query.entity, ['Car', 'Partner', 'Earning', 'Expense'], 'Entity');
  if (req.query.entityId) filter.entityId = v.id(req.query.entityId);
  const limit = v.integer(req.query.limit ?? 50, 1, 200, 'Limit');
  const page = v.integer(req.query.page ?? 1, 1, 100000, 'Page');
  res.json(await AuditLog.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).populate('actor', 'name role'));
});
module.exports = router;
