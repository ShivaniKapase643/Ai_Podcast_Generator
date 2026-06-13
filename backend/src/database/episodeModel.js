import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

export function createEpisode(data) {
  const id = uuidv4();
  const episodeNumber = getNextEpisodeNumber();
  const stmt = db.prepare(`
    INSERT INTO episodes (id, title, date, episode_number, description, script, transcript, audio_path, transcript_path, pdf_path, duration, stories_count, topics, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    data.title,
    data.date,
    episodeNumber,
    data.description || '',
    data.script || '',
    data.transcript || '',
    data.audio_path || '',
    data.transcript_path || '',
    data.pdf_path || '',
    data.duration || 0,
    data.stories_count || 0,
    JSON.stringify(data.topics || []),
    data.status || 'pending'
  );
  return getEpisodeById(id);
}

export function getEpisodeById(id) {
  const stmt = db.prepare('SELECT * FROM episodes WHERE id = ?');
  const episode = stmt.get(id);
  if (episode) {
    episode.topics = JSON.parse(episode.topics || '[]');
  }
  return episode;
}

export function getAllEpisodes(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const stmt = db.prepare('SELECT * FROM episodes ORDER BY created_at DESC LIMIT ? OFFSET ?');
  const episodes = stmt.all(limit, offset);
  const countStmt = db.prepare('SELECT COUNT(*) as total FROM episodes');
  const { total } = countStmt.get();
  return {
    episodes: episodes.map(ep => ({ ...ep, topics: JSON.parse(ep.topics || '[]') })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export function updateEpisode(id, data) {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(data)) {
    if (key === 'topics') {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  fields.push("updated_at = datetime('now')");
  values.push(id);
  const stmt = db.prepare(`UPDATE episodes SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getEpisodeById(id);
}

export function deleteEpisode(id) {
  const stmt = db.prepare('DELETE FROM episodes WHERE id = ?');
  return stmt.run(id);
}

export function getEpisodeStats() {
  const totalEpisodes = db.prepare('SELECT COUNT(*) as count FROM episodes WHERE status = ?').get('completed');
  const totalDuration = db.prepare('SELECT SUM(duration) as total FROM episodes WHERE status = ?').get('completed');
  const topicsStmt = db.prepare('SELECT topics FROM episodes WHERE status = ?');
  const allEpisodes = topicsStmt.all('completed');

  const topicCounts = {};
  allEpisodes.forEach(ep => {
    const topics = JSON.parse(ep.topics || '[]');
    topics.forEach(t => {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
  });

  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));

  return {
    totalEpisodes: totalEpisodes.count,
    totalDuration: totalDuration.total || 0,
    topTopics
  };
}

function getNextEpisodeNumber() {
  const stmt = db.prepare('SELECT MAX(episode_number) as max_num FROM episodes');
  const result = stmt.get();
  return (result.max_num || 0) + 1;
}

export function getRecentEpisodes(days = 7) {
  const stmt = db.prepare(`
    SELECT * FROM episodes 
    WHERE status = 'completed' AND date >= date('now', '-' || ? || ' days')
    ORDER BY date DESC
  `);
  return stmt.all(days).map(ep => ({ ...ep, topics: JSON.parse(ep.topics || '[]') }));
}
