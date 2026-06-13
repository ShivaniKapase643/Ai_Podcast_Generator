import logger from './logger.js';

export async function withRetry(fn, options = {}) {
  const { maxAttempts = 3, delay = 1000, backoff = 2, name = 'operation' } = options;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(`${name} failed (attempt ${attempt}/${maxAttempts}): ${error.message}`);

      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        logger.info(`Retrying ${name} in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  logger.error(`${name} failed after ${maxAttempts} attempts`, { error: lastError.message });
  throw lastError;
}
