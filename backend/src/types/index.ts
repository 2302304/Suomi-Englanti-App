export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface Word {
  id: number;
  english: string;
  finnish: string;
  word_class?: string;
  difficulty_level: number;
  frequency_rank?: number;
  created_at: Date;
}

export interface Sentence {
  id: number;
  english_sentence: string;
  finnish_sentence: string;
  difficulty_level: number;
  created_at: Date;
}

export interface WordSentence {
  id: number;
  word_id: number;
  sentence_id: number;
}

export interface UserProgress {
  id: number;
  user_id: number;
  word_id: number;
  last_reviewed?: Date;
  next_review?: Date;
  correct_count: number;
  incorrect_count: number;
  ease_factor: number;
  interval_days: number;
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface SpacedRepetitionUpdate {
  ease_factor: number;
  interval_days: number;
  next_review: Date;
}

export interface ProgressStats {
  total_words: number;
  words_learned: number;
  words_in_progress: number;
  total_reviews: number;
  accuracy: number;
  current_streak: number;
  words_due_today: number;
}
