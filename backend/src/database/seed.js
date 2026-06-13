import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

export function seedDemoData() {
  // Check if episodes already exist
  const existing = db.prepare('SELECT COUNT(*) as count FROM episodes').get();
  if (existing.count > 0) return;

  const demoEpisodes = [
    {
      id: uuidv4(),
      title: 'AI News - 2024-07-10',
      date: '2024-07-10',
      episode_number: 1,
      description: 'OpenAI launches GPT-4o Mini | Meta releases Llama 3.1 | Google DeepMind solves protein folding',
      script: getSampleScript(1, '2024-07-10'),
      transcript: getSampleTranscript(1),
      duration: 480,
      stories_count: 5,
      topics: JSON.stringify(['#LLM', '#OpenSource', '#Research']),
      status: 'completed'
    },
    {
      id: uuidv4(),
      title: 'AI News - 2024-07-11',
      date: '2024-07-11',
      episode_number: 2,
      description: 'Anthropic raises $2B | Stability AI open-sources SD3 | EU AI Act enforcement begins',
      script: getSampleScript(2, '2024-07-11'),
      transcript: getSampleTranscript(2),
      duration: 540,
      stories_count: 6,
      topics: JSON.stringify(['#Startup', '#OpenSource', '#Regulation']),
      status: 'completed'
    },
    {
      id: uuidv4(),
      title: 'AI News - 2024-07-12',
      date: '2024-07-12',
      episode_number: 3,
      description: 'Apple Intelligence preview | NVIDIA hits $3T valuation | Mistral launches Le Chat',
      script: getSampleScript(3, '2024-07-12'),
      transcript: getSampleTranscript(3),
      duration: 510,
      stories_count: 7,
      topics: JSON.stringify(['#ProductLaunch', '#Hardware', '#LLM']),
      status: 'completed'
    },
    {
      id: uuidv4(),
      title: 'AI News - 2024-07-13',
      date: '2024-07-13',
      episode_number: 4,
      description: 'GitHub Copilot Workspace launches | Runway Gen-3 Alpha | AI voice cloning regulations proposed',
      script: getSampleScript(4, '2024-07-13'),
      transcript: getSampleTranscript(4),
      duration: 465,
      stories_count: 5,
      topics: JSON.stringify(['#ProductLaunch', '#Research', '#Regulation', '#Ethics']),
      status: 'completed'
    },
    {
      id: uuidv4(),
      title: 'AI News - 2024-07-14',
      date: '2024-07-14',
      episode_number: 5,
      description: 'xAI open-sources Grok | Google Gemini 1.5 Pro update | Hugging Face raises $235M',
      script: getSampleScript(5, '2024-07-14'),
      transcript: getSampleTranscript(5),
      duration: 530,
      stories_count: 6,
      topics: JSON.stringify(['#OpenSource', '#LLM', '#Startup']),
      status: 'completed'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO episodes (id, title, date, episode_number, description, script, transcript, audio_path, transcript_path, pdf_path, duration, stories_count, topics, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ep of demoEpisodes) {
    stmt.run(
      ep.id, ep.title, ep.date, ep.episode_number, ep.description,
      ep.script, ep.transcript, '', '', '', ep.duration,
      ep.stories_count, ep.topics, ep.status
    );
  }

  // Add demo subscribers
  const subStmt = db.prepare('INSERT OR IGNORE INTO subscribers (id, email, name, active) VALUES (?, ?, ?, ?)');
  subStmt.run(uuidv4(), 'demo@example.com', 'Demo User', 1);
  subStmt.run(uuidv4(), 'listener@podcast.ai', 'AI Enthusiast', 1);

  console.log('✅ Demo data seeded: 5 episodes, 2 subscribers');
}

function getSampleScript(epNum, date) {
  return `[00:00] INTRO

Hey everyone, welcome back to AI Daily Digest! I'm Alex, and this is Episode #${epNum}, recorded on ${date}.

We've got some incredible stories today — the AI world never sleeps, and neither do we. Let's jump right in.

[01:30] STORY 1

Our top story today involves a major development in the large language model space. This represents a significant shift in how we think about AI capabilities and accessibility.

The implications here are huge — we're talking about democratizing AI access for developers and businesses of all sizes.

[03:00] STORY 2

Moving on to our next story, there's been a breakthrough in open-source AI that's got the community buzzing.

This matters because open-source AI models are the backbone of innovation. When these models improve, everyone benefits.

[05:00] STORY 3

Next up, we're looking at the regulatory landscape. Governments are finally starting to catch up with AI technology.

The question is: will regulation help or hinder innovation? That's the trillion-dollar question.

[07:00] OUTRO

And that wraps up today's episode! To recap: big moves in LLMs, exciting open-source releases, and the regulatory landscape shifting beneath our feet.

If you enjoyed today's episode, make sure to subscribe and share with a fellow AI enthusiast. I'll be back tomorrow with more stories from the cutting edge of artificial intelligence.

Until then, keep building the future. This is Alex, signing off from AI Daily Digest.`;
}

function getSampleTranscript(epNum) {
  return `AI Daily Digest - Episode #${epNum}

[00:00] Introduction
Welcome to AI Daily Digest. Today we cover the latest in artificial intelligence, machine learning, and tech innovation.

[01:30] Story 1 - Major LLM Development
A significant advancement in large language model technology was announced today, pushing the boundaries of what's possible with AI.

[03:00] Story 2 - Open Source AI Progress  
The open-source AI community continues to thrive with new model releases and improved accessibility for developers worldwide.

[05:00] Story 3 - AI Regulation Update
Regulatory bodies are working on frameworks to govern AI development while maintaining innovation-friendly policies.

[07:00] Conclusion
Thank you for listening. Subscribe for daily updates on AI news and developments.`;
}

export default { seedDemoData };
