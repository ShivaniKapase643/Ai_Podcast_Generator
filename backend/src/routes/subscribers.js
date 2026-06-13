import { Router } from 'express';
import { addSubscriber, removeSubscriber, getAllSubscribers, deleteSubscriber } from '../database/subscriberModel.js';
import { subscribeLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

const router = Router();

// Subscribe
router.post('/subscribers', subscribeLimiter, (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const subscriber = addSubscriber(email, name);
    logger.info(`New subscriber: ${email}`);
    res.status(201).json({ message: 'Subscribed successfully', subscriber });
  } catch (error) {
    logger.error('Subscribe failed', { error: error.message });
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe
router.delete('/subscribers/:email', (req, res) => {
  try {
    const { email } = req.params;
    removeSubscriber(email);
    logger.info(`Unsubscribed: ${email}`);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    logger.error('Unsubscribe failed', { error: error.message });
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// List subscribers (admin)
router.get('/subscribers', (req, res) => {
  try {
    const subscribers = getAllSubscribers(false);
    res.json({ subscribers, total: subscribers.length });
  } catch (error) {
    logger.error('List subscribers failed', { error: error.message });
    res.status(500).json({ error: 'Failed to list subscribers' });
  }
});

// Unsubscribe via query param (for email links)
router.get('/subscribers/unsubscribe', (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    removeSubscriber(email);
    res.send('<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>Unsubscribed</h2><p>You have been successfully unsubscribed.</p></body></html>');
  } catch (error) {
    res.status(500).send('Failed to unsubscribe');
  }
});

export default router;
