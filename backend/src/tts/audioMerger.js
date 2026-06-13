import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../../assets');

/**
 * Optional: Merge intro music with podcast audio
 * If intro.mp3 exists in /assets, prepend it to the episode audio
 * For simplicity, this does a basic concatenation of raw MP3 buffers
 */
export async function mergeWithIntro(podcastBuffer) {
  const introPath = path.join(assetsDir, 'intro.mp3');

  if (!fs.existsSync(introPath)) {
    logger.debug('No intro.mp3 found in assets, skipping merge');
    return podcastBuffer;
  }

  try {
    const introBuffer = fs.readFileSync(introPath);
    const merged = Buffer.concat([introBuffer, podcastBuffer]);
    logger.info('Merged intro music with podcast audio');
    return merged;
  } catch (error) {
    logger.warn(`Failed to merge intro: ${error.message}`);
    return podcastBuffer;
  }
}

/**
 * Optional: Merge outro music with podcast audio
 */
export async function mergeWithOutro(podcastBuffer) {
  const outroPath = path.join(assetsDir, 'outro.mp3');

  if (!fs.existsSync(outroPath)) {
    return podcastBuffer;
  }

  try {
    const outroBuffer = fs.readFileSync(outroPath);
    const merged = Buffer.concat([podcastBuffer, outroBuffer]);
    logger.info('Merged outro music with podcast audio');
    return merged;
  } catch (error) {
    logger.warn(`Failed to merge outro: ${error.message}`);
    return podcastBuffer;
  }
}

export default { mergeWithIntro, mergeWithOutro };
