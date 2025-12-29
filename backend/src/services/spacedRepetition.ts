import { SpacedRepetitionUpdate } from '../types';

/**
 * Simplified SM-2 (SuperMemo 2) Algorithm for Spaced Repetition
 *
 * This algorithm calculates the next review date based on:
 * - ease_factor: How easy/hard the user finds this word (1.3 - 2.5+)
 * - interval_days: Days until next review
 * - correct: Whether the user got the answer right
 */
export function calculateNextReview(
  ease_factor: number,
  interval_days: number,
  correct: boolean
): SpacedRepetitionUpdate {
  let newEaseFactor = ease_factor;
  let newIntervalDays = interval_days;

  if (correct) {
    // Correct answer - increase interval and slightly increase ease
    newIntervalDays = Math.round(interval_days * ease_factor);
    newEaseFactor = Math.min(2.5, ease_factor + 0.1);

    // Ensure minimum progression
    if (newIntervalDays === interval_days) {
      newIntervalDays = interval_days + 1;
    }
  } else {
    // Incorrect answer - reset to 1 day and decrease ease
    newIntervalDays = 1;
    newEaseFactor = Math.max(1.3, ease_factor - 0.2);
  }

  // Calculate next review date
  const next_review = new Date();
  next_review.setDate(next_review.getDate() + newIntervalDays);

  return {
    ease_factor: newEaseFactor,
    interval_days: newIntervalDays,
    next_review,
  };
}

/**
 * Get quality rating based on user performance
 * This can be used for more nuanced learning tracking
 */
export function getQualityRating(
  timeTaken: number, // seconds
  maxTime: number = 30 // seconds
): number {
  // 0-5 scale where 5 is best
  if (timeTaken < maxTime * 0.3) return 5; // Very fast
  if (timeTaken < maxTime * 0.5) return 4; // Fast
  if (timeTaken < maxTime * 0.7) return 3; // Normal
  if (timeTaken < maxTime) return 2; // Slow
  return 1; // Very slow
}

/**
 * Determine if a word is "learned" based on performance metrics
 */
export function isWordLearned(
  correct_count: number,
  incorrect_count: number,
  ease_factor: number
): boolean {
  // Consider a word learned if:
  // - At least 5 correct answers
  // - Accuracy > 80%
  // - Ease factor is relatively high
  const total = correct_count + incorrect_count;
  if (total < 5) return false;

  const accuracy = correct_count / total;
  return accuracy >= 0.8 && ease_factor >= 2.0;
}
