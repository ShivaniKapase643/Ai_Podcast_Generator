import axios from 'axios';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';
import { NEWS_SOURCES, AI_KEYWORDS } from './sources.js';

const BRIGHT_DATA_CONFIG = {
  host: process.env.BRIGHT_DATA_HOST || 'brd.superproxy.io',
  port: parseInt(process.env.BRIGHT_DATA_PORT || '22225'),
  username: process.env.BRIGHT_DATA_USERNAME,
  password: process.env.BRIGHT_DATA_PASSWORD
};

export async function scrapeAllSources() {
  const allArticles = [];

  for (const source of NEWS_SOURCES) {
    try {
      const articles = await scrapeSource(source);
      allArticles.push(...articles);
      logger.info(`Scraped ${articles.length} articles from ${source.name}`);
    } catch (error) {
      logger.error(`Failed to scrape ${source.name}: ${error.message}`);
    }
  }

  // Deduplicate by title similarity
  const deduplicated = deduplicateArticles(allArticles);
  
  // Filter only articles from past 24 hours
  const recent = filterRecentArticles(deduplicated);

  // Filter for AI relevance
  const relevant = filterAIRelevant(recent);

  logger.info(`Total unique recent AI articles: ${relevant.length}`);
  return relevant;
}

async function scrapeSource(source) {
  return withRetry(async () => {
    const proxyUrl = `http://${BRIGHT_DATA_CONFIG.username}:${BRIGHT_DATA_CONFIG.password}@${BRIGHT_DATA_CONFIG.host}:${BRIGHT_DATA_CONFIG.port}`;
    
    const response = await axios.get(source.url, {
      proxy: false,
      httpsAgent: undefined,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      },
      timeout: 30000,
      ...(BRIGHT_DATA_CONFIG.username ? {
        proxy: {
          host: BRIGHT_DATA_CONFIG.host,
          port: BRIGHT_DATA_CONFIG.port,
          auth: {
            username: BRIGHT_DATA_CONFIG.username,
            password: BRIGHT_DATA_CONFIG.password
          }
        }
      } : {})
    });

    const articles = parseHTML(response.data, source);
    return articles;
  }, { maxAttempts: 3, name: `scrape-${source.name}` });
}

function parseHTML(html, source) {
  // Basic HTML parsing using regex (lightweight, no heavy DOM library)
  const articles = [];
  const { selectors } = source;

  // Extract titles and links using regex patterns
  const titleRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
  let match;

  while ((match = titleRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();

    if (title.length > 20 && title.length < 200) {
      articles.push({
        title,
        url: url.startsWith('http') ? url : `${new URL(source.url).origin}${url}`,
        source: source.name,
        category: source.category,
        scrapedAt: new Date().toISOString()
      });
    }
  }

  return articles.slice(0, 20); // Limit per source
}

function deduplicateArticles(articles) {
  const seen = new Map();

  for (const article of articles) {
    const normalized = article.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const words = normalized.split(/\s+/);
    const key = words.slice(0, 6).join(' ');

    if (!seen.has(key)) {
      seen.set(key, article);
    }
  }

  return Array.from(seen.values());
}

function filterRecentArticles(articles) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return articles.filter(article => {
    if (article.publishedAt) {
      return new Date(article.publishedAt) >= twentyFourHoursAgo;
    }
    // If no date available, include it (scraped today)
    return true;
  });
}

function filterAIRelevant(articles) {
  return articles.filter(article => {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    return AI_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
  });
}

export default { scrapeAllSources };
