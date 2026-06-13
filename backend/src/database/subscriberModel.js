import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

export function addSubscriber(email, name = '') {
  const id = uuidv4();
  const stmt = db.prepare('INSERT OR IGNORE INTO subscribers (id, email, name) VALUES (?, ?, ?)');
  const result = stmt.run(id, email.toLowerCase().trim(), name);
  if (result.changes === 0) {
    // Already exists, reactivate if inactive
    const reactivate = db.prepare('UPDATE subscribers SET active = 1 WHERE email = ?');
    reactivate.run(email.toLowerCase().trim());
  }
  return getSubscriberByEmail(email);
}

export function removeSubscriber(email) {
  const stmt = db.prepare('UPDATE subscribers SET active = 0 WHERE email = ?');
  return stmt.run(email.toLowerCase().trim());
}

export function getSubscriberByEmail(email) {
  const stmt = db.prepare('SELECT * FROM subscribers WHERE email = ?');
  return stmt.get(email.toLowerCase().trim());
}

export function getAllSubscribers(activeOnly = true) {
  if (activeOnly) {
    return db.prepare('SELECT * FROM subscribers WHERE active = 1 ORDER BY subscribed_at DESC').all();
  }
  return db.prepare('SELECT * FROM subscribers ORDER BY subscribed_at DESC').all();
}

export function getSubscriberCount() {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM subscribers WHERE active = 1');
  return stmt.get().count;
}

export function deleteSubscriber(email) {
  const stmt = db.prepare('DELETE FROM subscribers WHERE email = ?');
  return stmt.run(email.toLowerCase().trim());
}
