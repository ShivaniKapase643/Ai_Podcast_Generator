import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { getAllSubscribers } from '../database/subscriberModel.js';
import { getRecentEpisodes } from '../database/episodeModel.js';

export async function sendWeeklyDigest() {
  const subscribers = getAllSubscribers(true);
  if (subscribers.length === 0) {
    logger.info('No subscribers for weekly digest');
    return;
  }

  const episodes = getRecentEpisodes(7);
  if (episodes.length === 0) {
    logger.info('No episodes this week for digest');
    return;
  }

  const showName = process.env.PODCAST_SHOW_NAME || 'AI Daily Digest';

  // Compile topics across the week
  const weeklyTopics = {};
  episodes.forEach(ep => {
    (ep.topics || []).forEach(topic => {
      weeklyTopics[topic] = (weeklyTopics[topic] || 0) + 1;
    });
  });

  const topTopics = Object.entries(weeklyTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  const htmlBody = generateDigestHtml({
    showName,
    episodes,
    topTopics,
    weekStart: episodes[episodes.length - 1]?.date || '',
    weekEnd: episodes[0]?.date || ''
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let sent = 0;
  for (const subscriber of subscribers) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"${showName}" <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: `📰 Week in AI — ${showName} Weekly Digest`,
        html: htmlBody
      });
      sent++;
    } catch (error) {
      logger.error(`Weekly digest failed for ${subscriber.email}:`, { error: error.message });
    }
  }

  logger.info(`Weekly digest sent to ${sent}/${subscribers.length} subscribers`);
}

function generateDigestHtml({ showName, episodes, topTopics, weekStart, weekEnd }) {
  const episodeList = episodes.map(ep => `
    <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
      <strong style="color: #06b6d4;">Episode #${ep.episode_number}</strong>
      <span style="color: #64748b; font-size: 12px; margin-left: 8px;">${ep.date}</span>
      <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">${ep.title}</p>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #e2e8f0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #06b6d4; margin: 0;">📰 Week in AI</h1>
      <p style="color: #94a3b8;">${showName} • ${weekStart} to ${weekEnd}</p>
    </div>
    
    <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="color: #f8fafc; margin-top: 0;">🔥 Hot Topics This Week</h3>
      <p style="color: #94a3b8;">${topTopics.join(' • ')}</p>
    </div>

    <h3 style="color: #f8fafc;">This Week's Episodes (${episodes.length})</h3>
    ${episodeList}

    <div style="text-align: center; margin-top: 32px; color: #64748b; font-size: 12px;">
      <p>You received this weekly digest from ${showName}.</p>
      <p><a href="#" style="color: #06b6d4;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

export default { sendWeeklyDigest };
