import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${req.method} ${req.path} - ${statusCode}: ${message}`, {
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
      status: statusCode,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      status: 404
    }
  });
}

export default { errorHandler, notFoundHandler };
