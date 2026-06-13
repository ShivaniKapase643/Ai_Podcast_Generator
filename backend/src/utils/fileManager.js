import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const episodesDir = path.resolve(__dirname, '../../', process.env.EPISODES_DIR || './episodes');

export function getEpisodeDir(date) {
  const dir = path.join(episodesDir, date);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function saveAudio(date, buffer) {
  const dir = getEpisodeDir(date);
  const filePath = path.join(dir, 'audio.mp3');
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function saveTranscript(date, text) {
  const dir = getEpisodeDir(date);
  const filePath = path.join(dir, 'transcript.txt');
  fs.writeFileSync(filePath, text, 'utf-8');
  return filePath;
}

export function savePdf(date, buffer) {
  const dir = getEpisodeDir(date);
  const filePath = path.join(dir, 'transcript.pdf');
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function saveMetadata(date, metadata) {
  const dir = getEpisodeDir(date);
  const filePath = path.join(dir, 'metadata.json');
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), 'utf-8');
  return filePath;
}

export function getAudioPath(date) {
  return path.join(episodesDir, date, 'audio.mp3');
}

export function getTranscriptPath(date) {
  return path.join(episodesDir, date, 'transcript.txt');
}

export function getPdfPath(date) {
  return path.join(episodesDir, date, 'transcript.pdf');
}

export function episodeFilesExist(date) {
  const dir = path.join(episodesDir, date);
  return fs.existsSync(dir) && fs.existsSync(path.join(dir, 'audio.mp3'));
}

export function deleteEpisodeFiles(date) {
  const dir = path.join(episodesDir, date);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export function ensureDirectories() {
  const dirs = [episodesDir, path.resolve(__dirname, '../../logs')];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}
