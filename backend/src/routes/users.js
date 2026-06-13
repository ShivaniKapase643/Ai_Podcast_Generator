import { Router } from 'express';
import {
  createUser, authenticateUser, getUserById, updateUserProfile,
  changePassword, createSession, validateSession, deleteSession,
  addBookmark, removeBookmark, getBookmarks,
  recordListening, getListeningHistory,
  rateEpisode, getEpisodeRating, getRecommendations
} from '../database/userModel.js';
import logger from '../utils/logger.js';

const router = Router();

// Auth middleware for user routes
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  const user = validateSession(token);
  if (!user) return res.status(401).json({ error: 'Invalid or expired session' });

  req.user = user;
  next();
}

// ─── AUTH ───────────────────────────────────────

// Register
router.post('/auth/register', (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = createUser({ username, email, password, displayName });
    const session = createSession(user.id);
    logger.info(`New user registered: ${username}`);
    res.status(201).json({ user, token: session.token });
  } catch (error) {
    logger.error('Registration failed', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/auth/login', (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const user = authenticateUser(emailOrUsername, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const session = createSession(user.id);
    logger.info(`User logged in: ${user.username}`);
    res.json({ user, token: session.token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/auth/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  deleteSession(token);
  res.json({ message: 'Logged out' });
});

// Get current user
router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── PROFILE ────────────────────────────────────

// Update profile
router.put('/profile', requireAuth, (req, res) => {
  try {
    const updated = updateUserProfile(req.user.id, req.body);
    res.json({ user: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change password
router.put('/profile/password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }
    changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ─── BOOKMARKS ──────────────────────────────────

router.get('/bookmarks', requireAuth, (req, res) => {
  const bookmarks = getBookmarks(req.user.id);
  res.json({ bookmarks });
});

router.post('/bookmarks/:episodeId', requireAuth, (req, res) => {
  const bookmarks = addBookmark(req.user.id, req.params.episodeId);
  res.json({ bookmarks });
});

router.delete('/bookmarks/:episodeId', requireAuth, (req, res) => {
  removeBookmark(req.user.id, req.params.episodeId);
  res.json({ message: 'Bookmark removed' });
});

// ─── LISTENING HISTORY ──────────────────────────

router.get('/history', requireAuth, (req, res) => {
  const history = getListeningHistory(req.user.id);
  res.json({ history });
});

router.post('/history', requireAuth, (req, res) => {
  const { episodeId, progressSeconds, completed } = req.body;
  recordListening(req.user.id, episodeId, progressSeconds, completed);
  res.json({ message: 'Progress saved' });
});

// ─── RATINGS ────────────────────────────────────

router.post('/episodes/:id/rate', requireAuth, (req, res) => {
  const { rating } = req.body;
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
  rateEpisode(req.user.id, req.params.id, rating);
  const result = getEpisodeRating(req.params.id);
  res.json(result);
});

router.get('/episodes/:id/rating', (req, res) => {
  const result = getEpisodeRating(req.params.id);
  res.json(result);
});

// ─── RECOMMENDATIONS ────────────────────────────

router.get('/recommendations', requireAuth, (req, res) => {
  const recommendations = getRecommendations(req.user.id);
  res.json({ recommendations });
});

export { requireAuth };
export default router;
