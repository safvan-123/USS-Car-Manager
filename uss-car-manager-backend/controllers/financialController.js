const Partner = require('../models/partnerModel');
const v = require('../utils/validation');
const { splitAmount, paidCents, normalisePayment } = require('../utils/money');
const { transaction, lockCar, audit, versionCheck, refId } = require('../utils/transactions');
const { filters, list } = require('../utils/query');
const { expenseTotal } = require('../utils/legacy');
const populate = [{ path: 'car' }, { path: 'partners.partnerId', select: 'name status sharePercentage' }];
function createFinancialController(Model, kind, amountKey, labelKey) {
  const recordTotal = record => kind === 'Expense' ? expenseTotal(record) : record.amount;
  function input(body, create) {
    v.object(body); const out = {};
    if (create || body[amountKey] !== undefined) out[amountKey] = v.rupees(v.cents(body[amountKey], amountKey, false));
    if (create || body[labelKey] !== undefined) out[labelKey] = v.text(body[labelKey], labelKey, 120, true);
    if (create || body.date !== undefined) out.date = v.date(body.date);
    if (body.notes !== undefined) out.notes = v.text(body.notes, 'Notes', 2000);
    if (kind === 'Expense' && body.type !== undefined) out.type = v.enumeration(body.type, ['expense', 'income'], 'Type');
    return out;
  }
  async function allocations(body, total, car, previous, session) {
    const old = previous ? previous.partners.map(p => p.toObject()) : [];
    const anyPaid = old.some(p => paidCents(p) > 0);
    const oldTotalChanged = previous && v.cents(recordTotal(previous)) !== v.cents(total);
    let rows;
    if (body.partners !== undefined) {
      if (!Array.isArray(body.partners)) v.fail('Partners must be an array');
      if (body.partners.length > 100) v.fail('A transaction supports at most 100 partner allocations');
      rows = body.partners.map(p => {
        v.object(p, 'Partner allocation');
        return { partnerId: refId(p.partnerId), amount: v.rupees(v.cents(p.amount)), ...(p.paid !== undefined ? { paid: p.paid } : {}), ...(p.paidAmount !== undefined ? { paidAmount: p.paidAmount } : {}) };
      });
      // Empty on create means auto-allocation; on edit it cannot erase existing shares.
      if (!rows.length && previous && old.length) v.fail('Existing partner allocations cannot be cleared');
    }
    if (!rows || !rows.length) {
      if (previous && !oldTotalChanged) return old; // notes/date edits preserve legacy data exactly
      if (anyPaid) v.fail('Cannot recalculate a transaction with recorded partner payments', 409);
      const partners = await Partner.find({ car, status: 'Active' }).sort({ _id: 1 }).session(session);
      if (!partners.length) return []; // Single-owner/no-partner cars retain an explicit unallocated state.
      rows = splitAmount(total, partners);
    }
    const ids = rows.map(p => p.partnerId);
    if (new Set(ids).size !== ids.length) v.fail('A partner cannot appear twice in a transaction');
    const known = await Partner.find({ _id: { $in: ids }, car }).session(session);
    if (known.length !== ids.length) v.fail('Every partner must exist and belong to this car');
    const map = new Map(known.map(p => [String(p._id), p]));
    const oldMap = new Map(old.map(p => [String(p.partnerId), p]));
    const updated = rows.map(row => {
      const prior = oldMap.get(row.partnerId), partner = map.get(row.partnerId);
      if (partner.status === 'Inactive' && !prior) v.fail('New allocations require active partners');
      return normalisePayment({ ...row, sharePercentage: prior?.sharePercentage ?? partner.sharePercentage }, prior);
    });
    const sameHistoricalAllocation = previous && !oldTotalChanged && rows.length === old.length && rows.every(row => oldMap.has(row.partnerId) && v.cents(row.amount) === v.cents(oldMap.get(row.partnerId).amount));
    if (!sameHistoricalAllocation && updated.reduce((n, r) => n + v.cents(r.amount), 0) !== v.cents(total)) v.fail('Partner amounts must add up exactly to the transaction total');
    if (anyPaid) {
      const changed = oldTotalChanged || rows.length !== old.length || rows.some(row => !oldMap.has(row.partnerId) || v.cents(row.amount) !== v.cents(oldMap.get(row.partnerId).amount));
      if (changed) v.fail('Cannot change allocation amounts after a partner payment has been recorded', 409);
    }
    return updated;
  }
  const getAll = (req, res) => list(Model, filters(req.query, kind), req, res, populate);
  const getByCar = (req, res) => list(Model, { ...filters(req.query, kind), car: v.id(req.params.carId) }, req, res, populate);
  async function getOne(req, res) {
    const record = await Model.findById(v.id(req.params.id)).populate(populate);
    if (!record) v.fail(`${kind} not found`, 404);
    res.json(record);
  }
  async function create(req, res) {
    const fields = input(req.body, true), car = refId(req.body.car);
    const recordId = await transaction(async session => {
      await lockCar(car, session);
      const partners = await allocations(req.body, fields[amountKey], car, null, session);
      const [record] = await Model.create([{ ...fields, car, partners }], { session });
      await audit(req, session, 'create', kind, record._id, { after: record.toObject() });
      return record._id;
    });
    res.status(201).json(await Model.findById(recordId).populate(populate));
  }
  async function update(req, res) {
    const fields = input(req.body, false), recordId = v.id(req.params.id);
    await transaction(async session => {
      const record = await Model.findById(recordId).session(session);
      if (!record) v.fail(`${kind} not found`, 404);
      await lockCar(record.car, session);
      versionCheck(record, req.body);
      if (req.body.car !== undefined && refId(req.body.car) !== String(record.car)) v.fail('A financial record cannot be moved to another car');
      if (kind === 'Expense' && fields.type !== undefined && fields.type !== record.type) v.fail('Transaction type cannot change after creation');
      const before = record.toObject();
      const partners = await allocations(req.body, fields[amountKey] ?? recordTotal(record), record.car, record, session);
      Object.assign(record, fields, { partners });
      await record.save({ session });
      await audit(req, session, 'update', kind, record._id, { before, after: record.toObject() });
    });
    res.json(await Model.findById(recordId).populate(populate));
  }
  async function remove(req, res) {
    await transaction(async session => {
      const record = await Model.findById(v.id(req.params.id)).session(session);
      if (!record) v.fail(`${kind} not found`, 404);
      await lockCar(record.car, session, true);
      if (record.partners.some(p => paidCents(p) > 0)) v.fail('Cannot delete a transaction with recorded partner payments', 409);
      await audit(req, session, 'delete', kind, record._id, { before: record.toObject() });
      await record.deleteOne({ session });
    });
    res.json({ message: `${kind} deleted; audit history retained` });
  }
  async function correctPayment(req, res) {
    v.object(req.body);
    const reason = v.text(req.body.reason, 'Correction reason', 500, true);
    if (reason.length < 10) v.fail('Explain the correction in at least 10 characters');
    const recordId = v.id(req.params.id), partnerId = refId(req.body.partnerId);
    const paidAmount = v.rupees(v.cents(req.body.paidAmount, 'Paid amount'));
    await transaction(async session => {
      const record = await Model.findById(recordId).session(session);
      if (!record) v.fail(`${kind} not found`, 404);
      await lockCar(record.car, session, true);
      versionCheck(record, req.body);
      const allocation = record.partners.find(p => String(p.partnerId) === partnerId);
      if (!allocation) v.fail('Partner allocation not found', 404);
      const before = record.toObject();
      const corrected = normalisePayment({ ...allocation.toObject(), paidAmount }, allocation, true);
      allocation.paidAmount = corrected.paidAmount; allocation.paid = corrected.paid;
      await record.save({ session });
      await audit(req, session, 'correct-payment', kind, record._id, { reason, before, after: record.toObject() });
    });
    res.json(await Model.findById(recordId).populate(populate));
  }
  return { create, getAll, getByCar, getOne, update, remove, correctPayment };
}
module.exports = createFinancialController;
