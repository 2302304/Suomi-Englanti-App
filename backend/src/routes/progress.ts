import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { calculateNextReview, isWordLearned } from '../services/spacedRepetition';

const router = Router();

// Submit practice result and update progress
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { word_id, correct } = req.body;

    if (typeof word_id !== 'number' || typeof correct !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Get current progress or defaults
    const progressResult = await query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND word_id = $2',
      [userId, word_id]
    );

    let ease_factor = 2.5;
    let interval_days = 1;
    let correct_count = 0;
    let incorrect_count = 0;

    if (progressResult.rows.length > 0) {
      const progress = progressResult.rows[0];
      ease_factor = progress.ease_factor;
      interval_days = progress.interval_days;
      correct_count = progress.correct_count;
      incorrect_count = progress.incorrect_count;
    }

    // Update counts
    if (correct) {
      correct_count++;
    } else {
      incorrect_count++;
    }

    // Calculate next review
    const update = calculateNextReview(ease_factor, interval_days, correct);

    // Upsert progress
    const result = await query(
      `INSERT INTO user_progress (user_id, word_id, last_reviewed, next_review, correct_count, incorrect_count, ease_factor, interval_days)
       VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, word_id)
       DO UPDATE SET
         last_reviewed = NOW(),
         next_review = $3,
         correct_count = $4,
         incorrect_count = $5,
         ease_factor = $6,
         interval_days = $7
       RETURNING *`,
      [
        userId,
        word_id,
        update.next_review,
        correct_count,
        incorrect_count,
        update.ease_factor,
        update.interval_days,
      ]
    );

    const learned = isWordLearned(
      correct_count,
      incorrect_count,
      update.ease_factor
    );

    res.json({
      message: 'Progress updated',
      progress: result.rows[0],
      learned,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Total words in database
    const totalWordsResult = await query('SELECT COUNT(*) FROM words');
    const total_words = parseInt(totalWordsResult.rows[0].count);

    // User's progress
    const progressResult = await query(
      `SELECT
         COUNT(*) as words_started,
         SUM(CASE WHEN correct_count >= 5 AND (correct_count::float / NULLIF(correct_count + incorrect_count, 0)) >= 0.8 THEN 1 ELSE 0 END) as words_learned,
         SUM(correct_count) as total_correct,
         SUM(incorrect_count) as total_incorrect
       FROM user_progress
       WHERE user_id = $1`,
      [userId]
    );

    const stats = progressResult.rows[0];

    // Words due today
    const dueResult = await query(
      'SELECT COUNT(*) FROM user_progress WHERE user_id = $1 AND next_review <= NOW()',
      [userId]
    );
    const words_due_today = parseInt(dueResult.rows[0].count);

    // Calculate accuracy
    const total_reviews =
      parseInt(stats.total_correct || 0) + parseInt(stats.total_incorrect || 0);
    const accuracy =
      total_reviews > 0
        ? (parseInt(stats.total_correct || 0) / total_reviews) * 100
        : 0;

    // Streak calculation (simplified - could be enhanced)
    const streakResult = await query(
      `SELECT COUNT(DISTINCT DATE(last_reviewed)) as days
       FROM user_progress
       WHERE user_id = $1 AND last_reviewed >= NOW() - INTERVAL '30 days'`,
      [userId]
    );
    const current_streak = parseInt(streakResult.rows[0].days || 0);

    res.json({
      total_words,
      words_started: parseInt(stats.words_started || 0),
      words_learned: parseInt(stats.words_learned || 0),
      words_in_progress:
        parseInt(stats.words_started || 0) - parseInt(stats.words_learned || 0),
      total_reviews,
      accuracy: Math.round(accuracy),
      current_streak,
      words_due_today,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get dashboard data
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get recent activity (last 7 days)
    const activityResult = await query(
      `SELECT
         DATE(last_reviewed) as date,
         COUNT(*) as reviews,
         SUM(CASE WHEN correct_count > incorrect_count THEN 1 ELSE 0 END) as correct
       FROM user_progress
       WHERE user_id = $1 AND last_reviewed >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(last_reviewed)
       ORDER BY date DESC`,
      [userId]
    );

    // Get difficult words (most mistakes)
    const difficultWordsResult = await query(
      `SELECT w.english, w.finnish, up.correct_count, up.incorrect_count
       FROM words w
       INNER JOIN user_progress up ON w.id = up.word_id
       WHERE up.user_id = $1 AND up.incorrect_count > 0
       ORDER BY (up.incorrect_count::float / NULLIF(up.correct_count + up.incorrect_count, 0)) DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      recent_activity: activityResult.rows,
      difficult_words: difficultWordsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
