function cell(value) {
  let text = value == null ? '' : String(value);
  // Quote alone does not prevent spreadsheet formula execution.
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
module.exports = rows => '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
