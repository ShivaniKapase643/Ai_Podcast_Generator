import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { getAllSubscribers } from '../database/subscriberModel.js';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

function parseTopics(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export async function sendEpisodeEmail(episode, pdfBuffer) {
  // Skip if email not configured
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    logger.info('Email not configured, skipping delivery');
    return;
  }

  const subscribers = getAllSubscribers(true);
  if (subscribers.length === 0) {
    logger.info('No subscribers to send to');
    return;
  }

  const showName = process.env.PODCAST_SHOW_NAME || 'AI Daily Digest';
  const topics = parseTopics(episode.topics);
  const topStories = episode.description || 'Check out today\'s top AI news stories.';

  const htmlBody = generateEmailHtml({
    showName,
    episodeNumber: episode.episode_number,
    date: episode.date,
    topics,
    description: topStories,
    episodeId: episode.id
  });

  const transport = getTransporter();
  let sent = 0;

  for (const subscriber of subscribers) {
    try {
      await transport.sendMail({
        from: process.env.EMAIL_FROM || `"${showName}" <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: `🎙️ ${showName} — Episode #${episode.episode_number} (${episode.date})`,
        html: htmlBody,
        attachments: pdfBuffer ? [{
          filename: `transcript-${episode.date}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }] : []
      });
      sent++;
    } catch (error) {
      logger.error(`Failed to send email to ${subscriber.email}:`, { error: error.message });
    }
  }

  logger.info(`Episode email sent to ${sent}/${subscribers.length} subscribers`);
}

function generateEmailHtml({ showName, episodeNumber, date, topics, description, episodeId }) {
  const apiBase = `http://localhost:${process.env.PORT || 5000}/api`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, sans-serif; margin: 0; padding: 0; background: #f8fafb; color: #1a2332; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .header h1 { color: #0d9488; margin: 0; font-size: 24px; }
    .header p { color: #64748b; margin: 8px 0 0 0; }
    .card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
    .topics { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    .tag { background: #f0fdfa; color: #0d9488; padding: 4px 12px; border-radius: 8px; font-size: 12px; border: 1px solid #ccfbf1; font-weight: 600; }
    .btn { display: inline-block; background: #0d9488; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 8px 4px; }
    .footer { text-align: center; margin-top: 32px; color: #94a3b8; font-size: 12px; }
    .footer a { color: #0d9488; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎙️ ${showName}</h1>
      <p>Episode #${episodeNumber} • ${date}</p>
    </div>
    <div class="card">
      <p style="color: #334155;">${description}</p>
      <div class="topics">${topics.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
    <div style="text-align: center;">
      <a href="${apiBase}/episodes/${episodeId}/audio" class="btn">🎧 Listen Now</a>
      <a href="${apiBase}/episodes/${episodeId}/pdf" class="btn" style="background: #fff; color: #0d9488; border: 2px solid #0d9488;">📄 Read Transcript</a>
    </div>
    <div class="footer">
      <p>You received this because you subscribed to ${showName}.</p>
    </div>
  </div>
</body>
</html>`;
}

export default { sendEpisodeEmail };
