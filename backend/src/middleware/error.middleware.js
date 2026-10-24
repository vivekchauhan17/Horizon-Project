export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const notFound = (req, res) => res.status(404).json({ error: 'Route not found' });
export const errorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'PDF is larger than 5 MB.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  const status = err.status || 500;
  if (status === 500) console.error('Server error:', err.message);
  res.status(status).json({ error: err instanceof HttpError ? err.message : 'Something went wrong on the server.' });
};
