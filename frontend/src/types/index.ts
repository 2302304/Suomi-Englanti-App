export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Word {
  id: number;
  english: string;
  finnish: string;
  word_class?: string;
  difficulty_level: number;
  frequency_rank?: number;
  created_at: string;
}

export interface Sentence {
  id: number;
  english_sentence: string;
  finnish_sentence: string;
  difficulty_level: number;
  created_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  word_id: number;
  last_reviewed?: string;
  next_review?: string;
  correct_count: number;
  incorrect_count: number;
  ease_factor: number;
  interval_days: number;
  created_at: string;
}

export interface ProgressStats {
  total_words: number;
  words_started: number;
  words_learned: number;
  words_in_progress: number;
  total_reviews: number;
  accuracy: number;
  current_streak: number;
  words_due_today: number;
}

export interface WordWithSentences {
  word: Word;
  sentences: Sentence[];
}

export interface PracticeResult {
  word_id: number;
  correct: boolean;
}
