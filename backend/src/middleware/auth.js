import logger from '../utils/logger.js';

export function apiKeyAuth(req, res, next) {
  // Skip auth in development mode if no key is set
  if (process.env.NODE_ENV === 'development' && !process.env.API_SECRET_KEY) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const secretKey = process.env.API_SECRET_KEY;

  if (!secretKey || secretKey === 'your_internal_api_key_here') {
    // No valid key configured, allow access in dev
    if (process.env.NODE_ENV === 'development') return next();
    logger.warn('API_SECRET_KEY not configured properly');
  }

  if (apiKey === secretKey) {
    return next();
  }

  // Allow unauthenticated access to certain endpoints
  const publicPaths = ['/api/health', '/api/episodes', '/api/subscribers'];
  if (publicPaths.some(p => req.path.startsWith(p)) && req.method === 'GET') {
    return next();
  }

  // In development, allow all requests
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  logger.warn(`Unauthorized API access attempt from ${req.ip}`);
  return res.status(401).json({ error: 'Unauthorized. Provide valid API key.' });
}

export default { apiKeyAuth };
