import OpenAI from 'openai';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSentiment(articles) {
  // If articles already have sentiment from ranking, skip
  const needsSentiment = articles.filter(a => !a.sentiment);
  if (needsSentiment.length === 0) return articles;

  return withRetry(async () => {
    const titles = needsSentiment.map((a, i) => `${i + 1}. ${a.title}`).join('\n');

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      max_tokens: 500,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `Analyze the sentiment of each news headline. Respond in JSON format:
{ "sentiments": ["positive", "negative", "neutral", ...] }
Only use: positive, negative, or neutral.`
        },
        {
          role: 'user',
          content: titles
        }
      ]
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      needsSentiment.forEach((article, i) => {
        article.sentiment = parsed.sentiments[i] || 'neutral';
      });
    }

    logger.info(`Analyzed sentiment for ${needsSentiment.length} articles`);
    return articles;
  }, { maxAttempts: 2, name: 'sentiment-analysis' });
}

export default { analyzeSentiment };
