import cron from 'node-cron';
import logger from '../utils/logger.js';
import db from '../database/db.js';
import { generateEpisode } from '../routes/generate.js';
import { sendWeeklyDigest } from '../delivery/newsletterDigest.js';

let dailyJob = null;
let weeklyJob = null;

export function startScheduler() {
  const schedule = getSchedule();
  const isEnabled = isAutoGenerateEnabled();

  if (isEnabled) {
    startDailyJob(schedule);
  }

  // Weekly digest every Sunday at 10 AM
  weeklyJob = cron.schedule('0 10 * * 0', async () => {
    logger.info('Running weekly newsletter digest...');
    try {
      await sendWeeklyDigest();
      logger.info('Weekly digest completed');
    } catch (error) {
      logger.error('Weekly digest failed', { error: error.message });
    }
  }, {
    timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
  });

  logger.info(`Scheduler initialized. Daily: ${isEnabled ? schedule : 'DISABLED'}. Weekly: Sundays 10AM.`);
}

function startDailyJob(schedule) {
  if (dailyJob) {
    dailyJob.stop();
  }

  dailyJob = cron.schedule(schedule, async () => {
    logger.info('Cron triggered: Starting daily episode generation...');
    try {
      await generateEpisode();
      logger.info('Daily episode generation completed');
    } catch (error) {
      logger.error('Daily generation failed', { error: error.message });
    }
  }, {
    timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
  });

  logger.info(`Daily cron job started: ${schedule}`);
}

export function toggleAutoGenerate(enabled) {
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_generate_enabled', ?)");
  stmt.run(enabled ? 'true' : 'false');

  if (enabled) {
    const schedule = getSchedule();
    startDailyJob(schedule);
  } else if (dailyJob) {
    dailyJob.stop();
    dailyJob = null;
  }

  logger.info(`Auto-generation ${enabled ? 'enabled' : 'disabled'}`);
}

export function isAutoGenerateEnabled() {
  const stmt = db.prepare("SELECT value FROM settings WHERE key = 'auto_generate_enabled'");
  const result = stmt.get();
  return result?.value !== 'false';
}

export function getSchedule() {
  const stmt = db.prepare("SELECT value FROM settings WHERE key = 'cron_schedule'");
  const result = stmt.get();
  return result?.value || process.env.CRON_SCHEDULE || '0 7 * * *';
}

export function updateSchedule(newSchedule) {
  if (!cron.validate(newSchedule)) {
    throw new Error(`Invalid cron expression: ${newSchedule}`);
  }
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('cron_schedule', ?)");
  stmt.run(newSchedule);

  if (isAutoGenerateEnabled()) {
    startDailyJob(newSchedule);
  }
}

export function stopScheduler() {
  if (dailyJob) dailyJob.stop();
  if (weeklyJob) weeklyJob.stop();
  logger.info('Scheduler stopped');
}

export default { startScheduler, stopScheduler, toggleAutoGenerate, isAutoGenerateEnabled, getSchedule, updateSchedule };
