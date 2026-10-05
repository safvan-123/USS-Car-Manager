const v = require('./validation');
function filters(query, kind) {
  const filter = {};
  if (query.car !== undefined) filter.car = v.id(query.car, 'car ID');
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = v.date(query.from, 'From date');
    if (query.to) {
      const end = v.date(query.to, 'To date');
      if (query.to.length === 10) end.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
    if (filter.date.$gte && filter.date.$lte && filter.date.$gte > filter.date.$lte) v.fail('From date must precede to date');
  }
  if (query.search !== undefined) {
    const search = v.escapeRegex(v.text(query.search, 'Search', 100));
    const fields = kind === 'Car' ? ['carName', 'carNumber', 'owner'] : kind === 'Partner' ? ['name'] : kind === 'Expense' ? ['category', 'notes'] : ['source', 'notes'];
    filter.$or = fields.map(field => ({ [field]: { $regex: search, $options: 'i' } }));
  }
  if (kind === 'Car') {
    delete filter.date;
    if (query.includeArchived !== 'true') filter.archived = { $ne: true };
    if (query.status) filter.status = v.enumeration(query.status, ['Available', 'Rented', 'Under Maintenance'], 'Status');
  }
  if (kind === 'Partner') {
    delete filter.date;
    if (query.status) filter.status = v.enumeration(query.status, ['Active', 'Inactive'], 'Status');
  }
  if (kind === 'Expense' && query.type) filter.type = v.enumeration(query.type, ['expense', 'income'], 'Type');
  return filter;
}
async function list(Model, filter, req, res, populate = []) {
  let q = Model.find(filter).sort({ date: -1, createdAt: -1, _id: -1 });
  for (const path of populate) q = q.populate(path);
  // Opt-in pagination preserves array responses and existing full-list totals.
  if (req.query.page !== undefined || req.query.limit !== undefined) {
    const page = v.integer(req.query.page ?? 1, 1, 100000, 'Page');
    const limit = v.integer(req.query.limit ?? 25, 1, 200, 'Limit');
    res.set('X-Total-Count', String(await Model.countDocuments(filter)));
    res.set('X-Page', String(page));
    q = q.skip((page - 1) * limit).limit(limit);
  }
  res.json(await q);
}
module.exports = { filters, list };
