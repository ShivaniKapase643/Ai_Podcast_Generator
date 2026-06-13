import Parser from 'rss-parser';
import logger from '../utils/logger.js';
import { NEWS_SOURCES, AI_KEYWORDS } from './sources.js';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'AI News Podcast Bot/1.0'
  }
});

export async function parseAllRSSFeeds() {
  const allArticles = [];

  for (const source of NEWS_SOURCES) {
    if (!source.rssUrl) continue;

    try {
      const articles = await parseRSSFeed(source);
      allArticles.push(...articles);
      logger.info(`RSS: Parsed ${articles.length} articles from ${source.name}`);
    } catch (error) {
      logger.warn(`RSS: Failed to parse ${source.name}: ${error.message}`);
    }
  }

  // Filter for AI relevance and recency
  const relevant = filterAIRelevant(allArticles);
  
  // If we have enough relevant articles, filter by recency; otherwise keep all
  const recent = relevant.length > 10 ? filterLast24Hours(relevant) : relevant;

  logger.info(`RSS: Total relevant articles: ${recent.length}`);
  return recent;
}

async function parseRSSFeed(source) {
  const feed = await parser.parseURL(source.rssUrl);
  
  return feed.items.map(item => ({
    title: item.title || '',
    url: item.link || '',
    summary: cleanHTML(item.contentSnippet || item.content || '').slice(0, 500),
    source: source.name,
    category: source.category,
    publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
    scrapedAt: new Date().toISOString()
  }));
}

function filterLast24Hours(articles) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return articles.filter(article => {
    if (article.publishedAt) {
      return new Date(article.publishedAt) >= cutoff;
    }
    return true;
  });
}

function filterAIRelevant(articles) {
  return articles.filter(article => {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    return AI_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
  });
}

function cleanHTML(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export default { parseAllRSSFeeds };
