import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getAllEpisodes, getEpisodeById, deleteEpisode, getEpisodeStats, updateEpisode } from '../database/episodeModel.js';
import { getAudioPath, getTranscriptPath, getPdfPath, deleteEpisodeFiles } from '../utils/fileManager.js';
import { generateTranscriptPdf } from '../delivery/pdfGenerator.js';
import logger from '../utils/logger.js';

const router = Router();

// List all episodes (paginated)
router.get('/episodes', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = getAllEpisodes(page, limit);
    res.json(result);
  } catch (error) {
    logger.error('Failed to list episodes', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve episodes' });
  }
});

// Get usage statistics
router.get('/episodes/stats', (req, res) => {
  try {
    const stats = getEpisodeStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get stats', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Get single episode
router.get('/episodes/:id', (req, res) => {
  try {
    const episode = getEpisodeById(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    res.json(episode);
  } catch (error) {
    logger.error('Failed to get episode', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve episode' });
  }
});

// Stream audio file
router.get('/episodes/:id/audio', (req, res) => {
  try {
    const episode = getEpisodeById(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    const audioPath = getAudioPath(episode.date);
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    const stat = fs.statSync(audioPath);
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = end - start + 1;

      const file = fs.createReadStream(audioPath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg'
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'audio/mpeg'
      });
      fs.createReadStream(audioPath).pipe(res);
    }
  } catch (error) {
    logger.error('Failed to stream audio', { error: error.message });
    res.status(500).json({ error: 'Failed to stream audio' });
  }
});

// Get transcript text
router.get('/episodes/:id/transcript', (req, res) => {
  try {
    const episode = getEpisodeById(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    if (episode.transcript) {
      return res.type('text/plain').send(episode.transcript);
    }

    const transcriptPath = getTranscriptPath(episode.date);
    if (fs.existsSync(transcriptPath)) {
      return res.type('text/plain').send(fs.readFileSync(transcriptPath, 'utf-8'));
    }

    res.status(404).json({ error: 'Transcript not found' });
  } catch (error) {
    logger.error('Failed to get transcript', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve transcript' });
  }
});

// Download transcript as PDF
router.get('/episodes/:id/pdf', async (req, res) => {
  try {
    const episode = getEpisodeById(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // Check if PDF already exists
    const pdfPath = getPdfPath(episode.date);
    if (fs.existsSync(pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="transcript-${episode.date}.pdf"`);
      return fs.createReadStream(pdfPath).pipe(res);
    }

    // Generate PDF on the fly
    if (!episode.transcript) {
      return res.status(404).json({ error: 'No transcript available for PDF generation' });
    }

    const pdfBuffer = await generateTranscriptPdf(episode.transcript, {
      title: episode.title,
      episodeNumber: episode.episode_number,
      date: episode.date,
      topics: episode.topics
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="transcript-${episode.date}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('Failed to get PDF', { error: error.message });
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Delete episode
router.delete('/episodes/:id', (req, res) => {
  try {
    const episode = getEpisodeById(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    deleteEpisodeFiles(episode.date);
    deleteEpisode(req.params.id);

    res.json({ message: 'Episode deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete episode', { error: error.message });
    res.status(500).json({ error: 'Failed to delete episode' });
  }
});

export default router;
