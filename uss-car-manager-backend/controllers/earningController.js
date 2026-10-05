const c = require('./financialController')(require('../models/Earning'), 'Earning', 'amount', 'source');
module.exports = { addEarning: c.create, getEarnings: c.getAll, getEarningsByCar: c.getByCar, getEarningById: c.getOne, updateEarning: c.update, deleteEarning: c.remove, correctPayment: c.correctPayment };
