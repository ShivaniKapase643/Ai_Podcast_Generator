import { Router } from 'express';
import { scrapeAllSources } from '../scrapers/brightDataScraper.js';
import { parseAllRSSFeeds } from '../scrapers/rssParser.js';
import { rankAndFilterArticles } from '../ai/topicRanker.js';
import { summarizeArticles } from '../ai/summarizer.js';
import { generatePodcastScript, extractTranscript } from '../ai/scriptGenerator.js';
import { generateAudio } from '../tts/elevenLabs.js';
import { mergeWithIntro, mergeWithOutro } from '../tts/audioMerger.js';
import { generateTranscriptPdf } from '../delivery/pdfGenerator.js';
import { sendEpisodeEmail } from '../delivery/emailSender.js';
import { createEpisode, updateEpisode } from '../database/episodeModel.js';
import { saveAudio, saveTranscript, savePdf, saveMetadata } from '../utils/fileManager.js';
import { generateLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

const router = Router();

// Manual generation trigger
router.post('/generate', generateLimiter, async (req, res) => {
  const dryRun = req.query.dryRun === 'true';

  try {
    const episode = await generateEpisode({ dryRun });
    res.json({ message: 'Episode generated successfully', episode });
  } catch (error) {
    logger.error('Generation failed', { error: error.message });
    res.status(500).json({ error: 'Generation failed', details: error.message });
  }
});

// SSE endpoint for real-time progress
router.get('/generate/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  // Send heartbeat every 15s to prevent timeout
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  const sendEvent = (data) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {}
  };

  sendEvent({ stage: 'connected', progress: 0, message: 'Connected. Starting generation...' });

  let closed = false;
  req.on('close', () => {
    closed = true;
    clearInterval(heartbeat);
  });

  generateEpisode({
    onProgress: (stage, progress, message) => {
      if (!closed) sendEvent({ stage, progress, message });
    }
  }).then(episode => {
    if (!closed) {
      sendEvent({ stage: 'complete', progress: 100, message: 'Episode generated successfully!', episode: { id: episode.id, episode_number: episode.episode_number, title: episode.title, status: episode.status } });
    }
    clearInterval(heartbeat);
    if (!closed) res.end();
  }).catch(error => {
    if (!closed) {
      sendEvent({ stage: 'error', progress: -1, message: error.message });
    }
    clearInterval(heartbeat);
    if (!closed) res.end();
  });
});

// News preview endpoint
router.get('/news/preview', async (req, res) => {
  try {
    let articles;
    try {
      articles = await parseAllRSSFeeds();
    } catch (error) {
      logger.warn('RSS failed for preview, trying Bright Data');
      articles = await scrapeAllSources();
    }
    res.json({ articles, count: articles.length });
  } catch (error) {
    logger.error('News preview failed', { error: error.message });
    res.status(500).json({ error: 'Failed to preview news' });
  }
});

// Core generation pipeline
export async function generateEpisode(options = {}) {
  const { dryRun = false, onProgress = () => {} } = options;
  const today = new Date().toISOString().split('T')[0];

  logger.info(`Starting episode generation for ${today} (dryRun: ${dryRun})`);

  // Step 1: Create episode record
  onProgress('initializing', 5, 'Creating episode record...');
  const episode = createEpisode({
    title: `AI News - ${today}`,
    date: today,
    status: 'generating'
  });

  try {
    // Step 2: Scrape news
    onProgress('scraping', 10, 'Scraping AI news from multiple sources...');
    let articles;
    try {
      articles = await parseAllRSSFeeds();
      onProgress('scraping', 20, `Found ${articles.length} articles via RSS feeds`);
    } catch (rssError) {
      logger.warn('RSS parsing failed, trying Bright Data...');
      try {
        articles = await scrapeAllSources();
        onProgress('scraping', 20, `Found ${articles.length} articles via Bright Data`);
      } catch (error) {
        throw new Error('Could not scrape news from any source');
      }
    }

    if (articles.length === 0) {
      throw new Error('No articles found from any source');
    }

    // Step 3: Rank and filter
    onProgress('ranking', 30, 'AI ranking and filtering top stories...');
    const rankedStories = await rankAndFilterArticles(articles);
    onProgress('ranking', 40, `Selected top ${rankedStories.length} stories`);

    // Step 4: Summarize
    onProgress('summarizing', 45, 'Generating summaries...');
    const summarizedStories = await summarizeArticles(rankedStories);
    onProgress('summarizing', 55, 'Summaries complete');

    // Step 5: Generate script
    onProgress('scripting', 60, 'Writing podcast script...');
    const script = await generatePodcastScript(summarizedStories, episode.episode_number, today);
    const transcript = extractTranscript(script);
    onProgress('scripting', 70, 'Script ready');

    // Collect topics
    const topics = [...new Set(summarizedStories.map(s => s.topicTag).filter(Boolean))];

    if (dryRun) {
      const updated = updateEpisode(episode.id, {
        title: `AI News - ${today}`,
        script,
        transcript,
        stories_count: summarizedStories.length,
        topics,
        status: 'draft',
        description: summarizedStories.slice(0, 3).map(s => s.title).join(' | ')
      });
      onProgress('complete', 100, 'Dry run complete (no audio generated)');
      logger.info(`Dry run complete: Episode #${episode.episode_number}`);
      return updated;
    }

    // Step 6: Generate audio (ElevenLabs → OpenAI TTS fallback)
    onProgress('audio', 75, 'Generating audio...');
    let audioBuffer = null;
    let duration = 0;
    try {
      const result = await generateAudio(script);
      audioBuffer = result.audioBuffer;
      duration = result.duration;

      // Optional: merge with intro/outro
      audioBuffer = await mergeWithIntro(audioBuffer);
      audioBuffer = await mergeWithOutro(audioBuffer);
      onProgress('audio', 88, 'Audio generated successfully');
    } catch (error) {
      logger.error('All TTS providers failed', { error: error.message });
      onProgress('audio', 88, 'Audio generation failed — saving transcript-only episode');
    }

    // Step 7: Save files
    onProgress('saving', 90, 'Saving files...');
    let audioPath = '';
    if (audioBuffer) {
      audioPath = saveAudio(today, audioBuffer);
    }
    const transcriptPath = saveTranscript(today, transcript);

    // Step 8: Generate PDF
    const pdfBuffer = await generateTranscriptPdf(transcript, {
      title: `AI News - ${today}`,
      episodeNumber: episode.episode_number,
      date: today,
      topics
    });
    const pdfPath = savePdf(today, pdfBuffer);

    // Save metadata
    saveMetadata(today, {
      episodeNumber: episode.episode_number,
      date: today,
      stories: summarizedStories.map(s => ({ title: s.title, source: s.source, topic: s.topicTag })),
      duration,
      generatedAt: new Date().toISOString()
    });

    // Step 9: Update database
    const updatedEpisode = updateEpisode(episode.id, {
      title: `AI News - ${today}`,
      description: summarizedStories.slice(0, 3).map(s => s.title).join(' | '),
      script,
      transcript,
      audio_path: audioPath,
      transcript_path: transcriptPath,
      pdf_path: pdfPath,
      duration,
      stories_count: summarizedStories.length,
      topics,
      status: audioBuffer ? 'completed' : 'draft'
    });

    // Step 10: Email delivery (non-blocking)
    onProgress('delivering', 95, 'Sending to subscribers...');
    try {
      await sendEpisodeEmail(updatedEpisode, pdfBuffer);
    } catch (error) {
      logger.warn('Email delivery skipped', { error: error.message });
    }

    onProgress('complete', 100, audioBuffer ? 'Episode generated with audio!' : 'Episode saved (no audio — check TTS config)');
    logger.info(`Episode #${episode.episode_number} generated (audio: ${!!audioBuffer})`);
    return updatedEpisode;

  } catch (error) {
    updateEpisode(episode.id, { status: 'failed' });
    logger.error('Episode generation failed', { error: error.message, stack: error.stack });
    throw error;
  }
}

export default router;
