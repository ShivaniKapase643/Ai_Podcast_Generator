import db from './db.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Simple password hashing (production would use bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'ai-podcast-salt-2024').digest('hex');
}

export function createUser({ username, email, password, displayName }) {
  const id = uuidv4();
  const passwordHash = hashPassword(password);
  const stmt = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, display_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  try {
    stmt.run(id, username.toLowerCase().trim(), email.toLowerCase().trim(), passwordHash, displayName || username);
    return getUserById(id);
  } catch (error) {
    if (error.message?.includes('UNIQUE')) {
      throw new Error('Username or email already exists');
    }
    throw error;
  }
}

export function authenticateUser(emailOrUsername, password) {
  const passwordHash = hashPassword(password);
  const stmt = db.prepare(`
    SELECT * FROM users WHERE (email = ? OR username = ?) AND password_hash = ?
  `);
  const user = stmt.get(emailOrUsername.toLowerCase().trim(), emailOrUsername.toLowerCase().trim(), passwordHash);
  if (user) {
    // Update last login
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
    user.preferred_topics = JSON.parse(user.preferred_topics || '[]');
    delete user.password_hash;
  }
  return user;
}

export function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(id);
  if (user) {
    user.preferred_topics = JSON.parse(user.preferred_topics || '[]');
    delete user.password_hash;
  }
  return user;
}

export function updateUserProfile(id, data) {
  const allowed = ['display_name', 'bio', 'avatar_url', 'preferred_topics', 'preferred_voice', 'preferred_length', 'notifications_enabled'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (allowed.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(key === 'preferred_topics' ? JSON.stringify(value) : value);
    }
  }

  if (fields.length === 0) return getUserById(id);

  values.push(id);
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getUserById(id);
}

export function changePassword(id, oldPassword, newPassword) {
  const oldHash = hashPassword(oldPassword);
  const user = db.prepare('SELECT * FROM users WHERE id = ? AND password_hash = ?').get(id, oldHash);
  if (!user) throw new Error('Current password is incorrect');

  const newHash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, id);
  return true;
}

// Session management
export function createSession(userId) {
  const token = uuidv4() + '-' + crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  return { token, expiresAt };
}

export function validateSession(token) {
  const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")').get(token);
  if (!session) return null;
  return getUserById(session.user_id);
}

export function deleteSession(token) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// Bookmarks
export function addBookmark(userId, episodeId) {
  const id = uuidv4();
  try {
    db.prepare('INSERT INTO bookmarks (id, user_id, episode_id) VALUES (?, ?, ?)').run(id, userId, episodeId);
  } catch {} // Ignore duplicate
  return getBookmarks(userId);
}

export function removeBookmark(userId, episodeId) {
  db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND episode_id = ?').run(userId, episodeId);
}

export function getBookmarks(userId) {
  return db.prepare(`
    SELECT b.*, e.title, e.date, e.episode_number, e.duration, e.topics, e.status
    FROM bookmarks b JOIN episodes e ON b.episode_id = e.id
    WHERE b.user_id = ? ORDER BY b.created_at DESC
  `).all(userId).map(b => ({ ...b, topics: JSON.parse(b.topics || '[]') }));
}

// Listening history
export function recordListening(userId, episodeId, progressSeconds, completed = false) {
  const id = uuidv4();
  const existing = db.prepare('SELECT id FROM listening_history WHERE user_id = ? AND episode_id = ?').get(userId, episodeId);
  if (existing) {
    db.prepare("UPDATE listening_history SET progress_seconds = ?, completed = ?, listened_at = datetime('now') WHERE id = ?")
      .run(progressSeconds, completed ? 1 : 0, existing.id);
  } else {
    db.prepare('INSERT INTO listening_history (id, user_id, episode_id, progress_seconds, completed) VALUES (?, ?, ?, ?, ?)')
      .run(id, userId, episodeId, progressSeconds, completed ? 1 : 0);
  }
}

export function getListeningHistory(userId, limit = 20) {
  return db.prepare(`
    SELECT lh.*, e.title, e.date, e.episode_number, e.duration, e.topics, e.status
    FROM listening_history lh JOIN episodes e ON lh.episode_id = e.id
    WHERE lh.user_id = ? ORDER BY lh.listened_at DESC LIMIT ?
  `).all(userId, limit).map(h => ({ ...h, topics: JSON.parse(h.topics || '[]') }));
}

// Ratings
export function rateEpisode(userId, episodeId, rating) {
  const id = uuidv4();
  const existing = db.prepare('SELECT id FROM ratings WHERE user_id = ? AND episode_id = ?').get(userId, episodeId);
  if (existing) {
    db.prepare('UPDATE ratings SET rating = ? WHERE id = ?').run(rating, existing.id);
  } else {
    db.prepare('INSERT INTO ratings (id, user_id, episode_id, rating) VALUES (?, ?, ?, ?)').run(id, userId, episodeId, rating);
  }
}

export function getEpisodeRating(episodeId) {
  const result = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM ratings WHERE episode_id = ?').get(episodeId);
  return { average: result.avg || 0, count: result.count || 0 };
}

// Recommendations
export function getRecommendations(userId) {
  const user = db.prepare('SELECT preferred_topics FROM users WHERE id = ?').get(userId);
  if (!user) return [];

  const topics = JSON.parse(user.preferred_topics || '[]');
  
  // Get episodes user hasn't listened to, weighted by preferred topics
  const listened = db.prepare('SELECT episode_id FROM listening_history WHERE user_id = ?').all(userId).map(h => h.episode_id);
  
  let allEpisodes = db.prepare("SELECT * FROM episodes WHERE status = 'completed' ORDER BY date DESC LIMIT 50").all();
  
  // Filter out already listened
  allEpisodes = allEpisodes.filter(ep => !listened.includes(ep.id));

  // Score by topic match
  const scored = allEpisodes.map(ep => {
    const epTopics = JSON.parse(ep.topics || '[]');
    let score = 0;
    epTopics.forEach(t => { if (topics.includes(t)) score += 2; });
    // Recency bonus
    const daysAgo = (Date.now() - new Date(ep.date).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysAgo);
    return { ...ep, score, topics: epTopics };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 10);
}
