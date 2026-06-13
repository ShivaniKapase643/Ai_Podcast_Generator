import OpenAI from 'openai';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizeArticles(articles) {
  const summarized = [];

  for (const article of articles) {
    try {
      const summary = await summarizeArticle(article);
      summarized.push({ ...article, summary });
    } catch (error) {
      logger.error(`Failed to summarize: ${article.title}`, { error: error.message });
      summarized.push({ ...article, summary: article.summary || article.title });
    }
  }

  return summarized;
}

async function summarizeArticle(article) {
  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      max_tokens: 300,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You are a concise tech news summarizer. Create a 2-3 sentence summary of the article that captures the key facts, impact, and significance. Write in a neutral, informative tone suitable for a podcast script.`
        },
        {
          role: 'user',
          content: `Title: ${article.title}\nSource: ${article.source}\n${article.summary ? `Content: ${article.summary}` : ''}\n${article.url ? `URL: ${article.url}` : ''}`
        }
      ]
    });

    return response.choices[0].message.content.trim();
  }, { maxAttempts: 2, name: `summarize-${article.title.slice(0, 30)}` });
}

export default { summarizeArticles };
