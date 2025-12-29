import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// Get all words with pagination
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const result = await query(
      'SELECT * FROM words ORDER BY frequency_rank ASC NULLS LAST, id ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM words');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      words: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({ error: 'Failed to fetch words' });
  }
});

// Get single word by ID with example sentences
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const wordResult = await query('SELECT * FROM words WHERE id = $1', [id]);

    if (wordResult.rows.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    // Get associated sentences
    const sentencesResult = await query(
      `SELECT s.* FROM sentences s
       INNER JOIN word_sentences ws ON s.id = ws.sentence_id
       WHERE ws.word_id = $1
       ORDER BY s.difficulty_level ASC
       LIMIT 10`,
      [id]
    );

    res.json({
      word: wordResult.rows[0],
      sentences: sentencesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({ error: 'Failed to fetch word' });
  }
});

// Search words
router.get('/search/query', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const q = req.query.q as string;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query too short' });
    }

    const result = await query(
      `SELECT * FROM words
       WHERE english ILIKE $1 OR finnish ILIKE $1
       ORDER BY frequency_rank ASC NULLS LAST
       LIMIT 50`,
      [`%${q}%`]
    );

    res.json({ words: result.rows });
  } catch (error) {
    console.error('Error searching words:', error);
    res.status(500).json({ error: 'Failed to search words' });
  }
});

// Get random word for flashcard practice
router.get('/random/card', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Prefer words that are due for review or haven't been seen
    const result = await query(
      `SELECT w.* FROM words w
       LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = $1
       WHERE up.id IS NULL OR up.next_review <= NOW()
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Fallback: get any random word
      const fallbackResult = await query(
        'SELECT * FROM words ORDER BY RANDOM() LIMIT 1'
      );
      return res.json({ word: fallbackResult.rows[0] });
    }

    res.json({ word: result.rows[0] });
  } catch (error) {
    console.error('Error fetching random word:', error);
    res.status(500).json({ error: 'Failed to fetch random word' });
  }
});

// Get words due for review (spaced repetition)
router.get('/review/due', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await query(
      `SELECT w.*, up.next_review, up.ease_factor, up.interval_days
       FROM words w
       INNER JOIN user_progress up ON w.id = up.word_id
       WHERE up.user_id = $1 AND up.next_review <= NOW()
       ORDER BY up.next_review ASC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({ words: result.rows });
  } catch (error) {
    console.error('Error fetching review words:', error);
    res.status(500).json({ error: 'Failed to fetch review words' });
  }
});

export default router;
