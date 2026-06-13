import logger from '../utils/logger.js';

export function apiKeyAuth(req, res, next) {
  // Always allow these routes without API key
  const publicPaths = [
    '/api/health',
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/me'
  ];

  if (publicPaths.some(p => req.path === p || req.path.startsWith(p))) {
    return next();
  }

  // Allow GET requests to episodes and subscribers (public data)
  if (req.method === 'GET' && (req.path.startsWith('/api/episodes') || req.path.startsWith('/api/subscribers') || req.path.startsWith('/api/schedule') || req.path.startsWith('/api/news'))) {
    return next();
  }

  // Skip auth in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check API key for other routes in production
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const secretKey = process.env.API_SECRET_KEY;

  if (!secretKey || secretKey === 'your_internal_api_key_here') {
    return next(); // No key configured, allow access
  }

  if (apiKey === secretKey) {
    return next();
  }

  // Check for Bearer token (user auth) - if present, allow through
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  logger.warn(`Unauthorized API access attempt from ${req.ip} to ${req.path}`);
  return res.status(401).json({ error: 'Unauthorized. Provide valid API key.' });
}

export default { apiKeyAuth };
