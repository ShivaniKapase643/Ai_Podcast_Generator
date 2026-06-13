import OpenAI from 'openai';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePodcastScript(stories, episodeNumber, date) {
  const hostName = process.env.PODCAST_HOST_NAME || 'Alex';
  const showName = process.env.PODCAST_SHOW_NAME || 'AI Daily Digest';
  const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '4000');

  const storySummaries = stories.map((s, i) => 
    `Story ${i + 1}: "${s.title}" [${s.source}] [${s.topicTag || '#AI'}]
Summary: ${s.summary}
Why it matters: ${s.whyItMatters || 'Significant development in AI/Tech'}
Sentiment: ${s.sentiment || 'neutral'}`
  ).join('\n\n');

  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `You are ${hostName}, the host of "${showName}" — a daily AI & Tech news podcast. Write a complete, professional podcast script.

SCRIPT STRUCTURE:
1. 🎙️ INTRO (30-45 seconds when read aloud)
   - Warm greeting, date, episode number
   - Teaser of top 2-3 stories
   - "Let's dive in"

2. 📰 STORY SEGMENTS (each 60-90 seconds)
   - Clear story title announcement
   - Summary of what happened
   - Analysis: what this means for the industry
   - Impact: who this affects and how
   - Natural transition to next story

3. 💬 TRANSITIONS
   - Use natural connectors between stories
   - Vary your transitions (don't repeat "Moving on to...")
   - Add brief personal commentary or questions

4. 🔮 OUTRO (30-45 seconds)
   - Quick recap of today's highlights
   - Teaser for tomorrow
   - Subscribe/share call-to-action
   - Sign off

STYLE RULES:
- Conversational and engaging, NOT robotic or formal
- Use short sentences suitable for audio
- Add occasional emphasis words in [brackets] for TTS guidance
- Target 1200-1800 words total (8-12 min podcast)
- Sound like a knowledgeable friend, not a newsreader
- Include timestamps like [00:00], [01:30], etc. for each section`
        },
        {
          role: 'user',
          content: `Write the complete podcast script for Episode #${episodeNumber} of "${showName}" for ${date}.

Here are today's top stories:

${storySummaries}

Generate the full script now.`
        }
      ]
    });

    const script = response.choices[0].message.content;
    logger.info(`Generated podcast script: ${script.split(/\s+/).length} words`);
    return script;
  }, { maxAttempts: 3, name: 'generate-script' });
}

export function extractTranscript(script) {
  // Clean up the script for transcript format
  return script
    .replace(/\[(\d{2}:\d{2})\]/g, '\n[$1]\n')
    .replace(/🎙️|📰|💬|🔮/g, '')
    .trim();
}

export default { generatePodcastScript, extractTranscript };
