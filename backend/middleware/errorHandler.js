/**
 * Catch-all 404 handler for unknown routes.
 */
export function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Global error handler — must have 4 params for Express to treat as error middleware.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isDev = process.env.NODE_ENV === 'development';

  console.error('[errorHandler]', err);

  const status = err.status || err.statusCode || 500;
  const message = (status < 500 || isDev) ? err.message : 'Internal server error.';

  res.status(status).json({
    error: message,
    ...(isDev && { stack: err.stack }),
  });
}
