const Partner = require('../models/partnerModel');
const Expense = require('../models/Expense');
const Earning = require('../models/Earning');
const v = require('../utils/validation');
const shares = require('../utils/shares');
const { filters, list } = require('../utils/query');
const { transaction, lockCar, audit, versionCheck, refId } = require('../utils/transactions');
function input(body, create = false) {
  v.object(body);
  const out = {};
  if (create || body.name !== undefined) out.name = v.text(body.name, 'Name', 100, true);
  if (create || body.sharePercentage !== undefined) {
    out.sharePercentage = v.percentage(body.sharePercentage);
  }
  if (body.status !== undefined) out.status = v.enumeration(body.status, ['Active', 'Inactive'], 'Status');
  for (const [group, fields] of [['contactDetails', { phone: 30, email: 254, address: 500 }], ['bankDetails', { accountNumber: 40, ifsc: 20, upiId: 150 }]]) {
    if (body[group] !== undefined) {
      v.object(body[group], group); out[group] = {};
      for (const [key, max] of Object.entries(fields)) if (body[group][key] !== undefined) out[group][key] = v.text(body[group][key], key, max);
      if (out[group].email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out[group].email)) v.fail('Invalid email');
    }
  }
  return out;
}
async function checkShares(car, changed, excluded, session) {
  const partners = await Partner.find({ car, status: 'Active', ...(excluded ? { _id: { $ne: excluded } } : {}) }).session(session);
  let total = shares.sumWeights(partners.map(p => p.sharePercentage));
  if (changed.status !== 'Inactive') total += shares.weight(changed.sharePercentage);
  if (total > shares.FULL + shares.TOLERANCE) v.fail('Active partner shares for this car cannot exceed 100%');
}
exports.createPartner = async (req, res) => {
  const fields = input(req.body, true), carId = refId(req.body.car);
  const result = await transaction(async session => {
    await lockCar(carId, session);
    await checkShares(carId, fields, null, session);
    const [partner] = await Partner.create([{ ...fields, car: carId }], { session });
    await audit(req, session, 'create', 'Partner', partner._id, { car: carId, sharePercentage: partner.sharePercentage });
    return partner._id;
  });
  res.status(201).json(await Partner.findById(result));
};
exports.getAllPartners = (req, res) => list(Partner, filters(req.query, 'Partner'), req, res, ['car']);
exports.getPartnersByCar = (req, res) => list(Partner, { ...filters(req.query, 'Partner'), car: v.id(req.params.carId) }, req, res, ['car']);
exports.getPartnerById = async (req, res) => {
  let query = Partner.findById(v.id(req.params.id)).populate('car');
  if (req.user.role === 'admin') query = query.select('+bankDetails');
  const partner = await query;
  if (!partner) v.fail('Partner not found', 404);
  res.json(partner);
};
exports.updatePartner = async (req, res) => {
  const fields = input(req.body), partnerId = v.id(req.params.id);
  await transaction(async session => {
    const partner = await Partner.findById(partnerId).select('+bankDetails').session(session);
    if (!partner) v.fail('Partner not found', 404);
    await lockCar(partner.car, session);
    versionCheck(partner, req.body);
    if (req.body.car !== undefined && refId(req.body.car) !== String(partner.car)) v.fail('A partner record cannot be moved to another car');
    for (const [key, value] of Object.entries(fields)) {
      if (['bankDetails', 'contactDetails'].includes(key)) {
        for (const [field, val] of Object.entries(value)) partner.set(`${key}.${field}`, val);
      } else partner[key] = value;
    }
    await checkShares(partner.car, partner, partner._id, session);
    await partner.save({ session });
    await audit(req, session, 'update', 'Partner', partner._id, { sharePercentage: partner.sharePercentage, status: partner.status, fields: Object.keys(fields) });
  });
  res.json(await Partner.findById(partnerId));
};
exports.deletePartner = async (req, res) => {
  await transaction(async session => {
    const partner = await Partner.findById(v.id(req.params.id)).session(session);
    if (!partner) v.fail('Partner not found', 404);
    await lockCar(partner.car, session, true);
    const expense = await Expense.exists({ 'partners.partnerId': partner._id }).session(session);
    const earning = await Earning.exists({ 'partners.partnerId': partner._id }).session(session);
    if (expense || earning) v.fail('This partner has financial history. Set status to Inactive instead.', 409);
    await partner.deleteOne({ session });
    await audit(req, session, 'delete', 'Partner', partner._id);
  });
  res.json({ message: 'Partner deleted' });
};
