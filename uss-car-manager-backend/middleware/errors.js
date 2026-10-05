module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let status = err.status || 500, message = status < 500 ? err.message : 'Server error. Please try again.';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join('; '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid field value or record ID'; }
  if (err.name === 'VersionError') { status = 409; message = 'Record changed. Refresh and try again.'; }
  if (err.code === 11000) { status = 409; message = 'A record with this unique value already exists'; }
  if (err.type === 'entity.parse.failed') { status = 400; message = 'Invalid JSON request body'; }
  if (err.type === 'entity.too.large') { status = 413; message = 'Request body is too large'; }
  if (status >= 500) console.error('Request failed:', err.name, err.code || '');
  res.status(status).json({ error: message, message });
};
