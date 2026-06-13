import axios from 'axios';
import OpenAI from 'openai';
import logger from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export async function generateAudio(script) {
  // Clean script for TTS
  const cleanedScript = cleanScriptForTTS(script);

  // Try ElevenLabs first, fall back to OpenAI TTS
  try {
    const result = await generateWithElevenLabs(cleanedScript);
    return result;
  } catch (elevenLabsError) {
    logger.warn(`ElevenLabs failed: ${elevenLabsError.message}. Trying OpenAI TTS...`);
    try {
      const result = await generateWithOpenAI(cleanedScript);
      return result;
    } catch (openaiError) {
      logger.error(`OpenAI TTS also failed: ${openaiError.message}`);
      throw new Error(`All TTS providers failed. ElevenLabs: ${elevenLabsError.message}. OpenAI: ${openaiError.message}`);
    }
  }
}

async function generateWithElevenLabs(cleanedScript) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const model = process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2';
  const stability = parseFloat(process.env.ELEVENLABS_STABILITY || '0.5');
  const similarityBoost = parseFloat(process.env.ELEVENLABS_SIMILARITY_BOOST || '0.8');

  if (!apiKey || apiKey === 'your_elevenlabs_api_key' || !voiceId || voiceId === 'your_preferred_voice_id') {
    throw new Error('ElevenLabs API key or voice ID not configured');
  }

  return withRetry(async () => {
    logger.info(`Generating audio with ElevenLabs (voice: ${voiceId})...`);

    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
      {
        text: cleanedScript,
        model_id: model,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        responseType: 'arraybuffer',
        timeout: 120000
      }
    ).catch(err => {
      if (err.response) {
        let errorMsg = `Status ${err.response.status}`;
        try {
          const body = Buffer.from(err.response.data).toString('utf-8');
          const parsed = JSON.parse(body);
          errorMsg = parsed.detail?.message || parsed.detail || body.slice(0, 200);
        } catch {}
        throw new Error(`ElevenLabs ${errorMsg}`);
      }
      throw err;
    });

    const audioBuffer = Buffer.from(response.data);
    const duration = estimateAudioDuration(cleanedScript);
    logger.info(`ElevenLabs audio: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB, ~${duration}s`);
    return { audioBuffer, duration };
  }, { maxAttempts: 2, name: 'elevenlabs-tts', delay: 3000 });
}

async function generateWithOpenAI(cleanedScript) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // OpenAI TTS has a 4096 char limit per request, so we chunk it
  const maxChars = 4000;
  const chunks = [];
  let remaining = cleanedScript;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }
    // Find a good break point
    let breakPoint = remaining.lastIndexOf('.', maxChars);
    if (breakPoint < maxChars / 2) breakPoint = remaining.lastIndexOf(' ', maxChars);
    if (breakPoint < maxChars / 2) breakPoint = maxChars;
    chunks.push(remaining.slice(0, breakPoint + 1));
    remaining = remaining.slice(breakPoint + 1).trim();
  }

  logger.info(`Generating audio with OpenAI TTS (${chunks.length} chunks)...`);

  const audioChunks = [];
  for (let i = 0; i < chunks.length; i++) {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: chunks[i],
      response_format: 'mp3'
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    audioChunks.push(buffer);
    logger.info(`OpenAI TTS chunk ${i + 1}/${chunks.length} done`);
  }

  const audioBuffer = Buffer.concat(audioChunks);
  const duration = estimateAudioDuration(cleanedScript);
  logger.info(`OpenAI TTS audio: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB, ~${duration}s`);
  return { audioBuffer, duration };
}

function cleanScriptForTTS(script) {
  return script
    .replace(/\[\d{2}:\d{2}\]/g, '')
    .replace(/🎙️|📰|💬|🔮|#\w+/g, '')
    .replace(/\[([^\]]*)\]/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/---+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function estimateAudioDuration(text) {
  const wordCount = text.split(/\s+/).length;
  return Math.round((wordCount / 150) * 60);
}

export default { generateAudio };
