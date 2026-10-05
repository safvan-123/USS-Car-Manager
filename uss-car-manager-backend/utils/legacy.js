const { cents } = require('./validation');
function expenseTotal(record) {
  // A present totalAmount is authoritative, including zero. Never add the two fields.
  return record.totalAmount == null ? record.amount : record.totalAmount;
}
function financialJson(doc, result, isExpense = false) {
  const populatedCarId = doc.populated('car');
  result.carId = String(populatedCarId || result.car?._id || result.car || '');
  result.missingCar = !!populatedCarId && result.car === null;
  if (isExpense && result.totalAmount == null && result.amount != null) {
    result.totalAmount = result.amount;
    result.usesLegacyAmount = true;
  }
  if (isExpense && result.type == null) result.type = 'expense';
  const warnings = [];
  try {
    const total = cents(isExpense ? expenseTotal(result) : result.amount);
    const assigned = (result.partners || []).reduce((sum, row) => sum + cents(row.amount), 0);
    result.allocationDifference = (total - assigned) / 100;
    result.allocationStatus = !(result.partners || []).length ? 'unallocated' : total === assigned ? 'balanced' : 'needs-review';
    if (result.allocationDifference) warnings.push('Partner allocations do not match the total. Existing values were retained.');
  } catch {
    result.allocationStatus = 'needs-review';
    warnings.push('Historical amount format needs review. Existing values were retained.');
  }
  if (result.missingCar) warnings.push('Referenced car no longer exists; record retained for review.');
  result.dataWarnings = warnings;
  return result;
}
module.exports = { expenseTotal, financialJson };
