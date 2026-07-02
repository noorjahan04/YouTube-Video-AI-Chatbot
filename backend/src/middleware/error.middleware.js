export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(', ') });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: `${Object.keys(err.keyValue)[0]} already exists` });
  }
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' });
};
