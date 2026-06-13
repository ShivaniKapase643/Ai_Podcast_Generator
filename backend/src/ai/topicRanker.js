import OpenAI from 'openai';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function rankAndFilterArticles(articles) {
  const maxStories = parseInt(process.env.MAX_STORIES_PER_EPISODE || '7');

  if (articles.length === 0) {
    logger.warn('No articles to rank');
    return [];
  }

  const articleList = articles.map((a, i) => `${i + 1}. [${a.source}] ${a.title}${a.summary ? ` - ${a.summary.slice(0, 100)}` : ''}`).join('\n');

  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `You are an AI/Tech news editor for a daily podcast. Your job is to select and rank the top ${maxStories} most important stories from today's news.

Rank by:
1. Novelty - Is this truly new information?
2. Impact - How many people does this affect?
3. Relevance - How central is this to AI/Tech?
4. Virality - Would listeners find this fascinating?

For each selected story, provide:
- rank (1-${maxStories})
- original_index (the number from the input list)
- topic_tag (one of: #LLM, #OpenSource, #Startup, #Research, #ProductLaunch, #Regulation, #Hardware, #Ethics)
- why_it_matters (one compelling sentence)
- sentiment (positive, negative, or neutral)

Respond in valid JSON format:
{
  "stories": [
    { "rank": 1, "original_index": 3, "topic_tag": "#LLM", "why_it_matters": "...", "sentiment": "positive" }
  ]
}`
        },
        {
          role: 'user',
          content: `Here are today's ${articles.length} scraped AI/Tech articles. Select and rank the top ${maxStories}:\n\n${articleList}`
        }
      ]
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse ranking response');

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Map back to original articles with ranking metadata
    const rankedArticles = parsed.stories.map(story => {
      const originalArticle = articles[story.original_index - 1];
      if (!originalArticle) return null;
      return {
        ...originalArticle,
        rank: story.rank,
        topicTag: story.topic_tag,
        whyItMatters: story.why_it_matters,
        sentiment: story.sentiment
      };
    }).filter(Boolean);

    logger.info(`Ranked ${rankedArticles.length} stories for podcast`);
    return rankedArticles;
  }, { maxAttempts: 3, name: 'rank-articles' });
}

export default { rankAndFilterArticles };
