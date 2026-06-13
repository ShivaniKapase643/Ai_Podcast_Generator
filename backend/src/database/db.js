import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../', process.env.DB_PATH || './database.sqlite');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

async function initDB() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS episodes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      episode_number INTEGER,
      description TEXT,
      script TEXT,
      transcript TEXT,
      audio_path TEXT,
      transcript_path TEXT,
      pdf_path TEXT,
      duration INTEGER DEFAULT 0,
      stories_count INTEGER DEFAULT 0,
      topics TEXT DEFAULT '[]',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      subscribed_at TEXT DEFAULT (datetime('now')),
      active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      episode_id TEXT,
      title TEXT NOT NULL,
      url TEXT,
      source TEXT,
      summary TEXT,
      sentiment TEXT,
      topic_tag TEXT,
      why_it_matters TEXT,
      rank_score REAL DEFAULT 0,
      scraped_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (episode_id) REFERENCES episodes(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Initialize default settings
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_generate_enabled', ?)`, [process.env.AUTO_GENERATE_ENABLED || 'true']);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('cron_schedule', ?)`, [process.env.CRON_SCHEDULE || '0 7 * * *']);

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      bio TEXT DEFAULT '',
      preferred_topics TEXT DEFAULT '[]',
      preferred_voice TEXT DEFAULT 'alloy',
      preferred_length TEXT DEFAULT 'medium',
      notifications_enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    )
  `);

  // Bookmarks
  db.run(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      episode_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (episode_id) REFERENCES episodes(id),
      UNIQUE(user_id, episode_id)
    )
  `);

  // Listening history
  db.run(`
    CREATE TABLE IF NOT EXISTS listening_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      episode_id TEXT NOT NULL,
      progress_seconds INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      listened_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (episode_id) REFERENCES episodes(id)
    )
  `);

  // Likes / ratings
  db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      episode_id TEXT NOT NULL,
      rating INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (episode_id) REFERENCES episodes(id),
      UNIQUE(user_id, episode_id)
    )
  `);

  // User sessions
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  save();
  return db;
}

function save() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Wrapper to provide a synchronous-feeling API while using sql.js
class DBWrapper {
  constructor() {
    this._ready = initDB().then(database => {
      this._db = database;
    });
  }

  async ensureReady() {
    await this._ready;
  }

  prepare(sql) {
    const self = this;
    return {
      run(...params) {
        self._db.run(sql, params);
        save();
        return { changes: self._db.getRowsModified() };
      },
      get(...params) {
        const stmt = self._db.prepare(sql);
        if (params.length) stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const results = [];
        const stmt = self._db.prepare(sql);
        if (params.length) stmt.bind(params);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  }

  exec(sql) {
    this._db.run(sql);
    save();
  }
}

const dbWrapper = new DBWrapper();
await dbWrapper.ensureReady();

export default dbWrapper;
