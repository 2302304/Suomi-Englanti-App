import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// Get all sentences
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM sentences ORDER BY difficulty_level ASC, id ASC'
    );

    res.json({ sentences: result.rows });
  } catch (error) {
    console.error('Error fetching sentences:', error);
    res.status(500).json({ error: 'Failed to fetch sentences' });
  }
});

// Get sentences for a specific word
router.get('/word/:wordId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { wordId } = req.params;

    const result = await query(
      `SELECT s.* FROM sentences s
       INNER JOIN word_sentences ws ON s.id = ws.sentence_id
       WHERE ws.word_id = $1
       ORDER BY s.difficulty_level ASC
       LIMIT 10`,
      [wordId]
    );

    res.json({ sentences: result.rows });
  } catch (error) {
    console.error('Error fetching sentences:', error);
    res.status(500).json({ error: 'Failed to fetch sentences' });
  }
});

// Get random sentence
router.get('/random', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM sentences ORDER BY RANDOM() LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No sentences found' });
    }

    res.json({ sentence: result.rows[0] });
  } catch (error) {
    console.error('Error fetching random sentence:', error);
    res.status(500).json({ error: 'Failed to fetch sentence' });
  }
});

export default router;
