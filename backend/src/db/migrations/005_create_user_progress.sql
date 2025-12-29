-- Create user_progress table for tracking learning progress
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  last_reviewed TIMESTAMP,
  next_review TIMESTAMP,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5 CHECK (ease_factor >= 1.3),  -- Spaced repetition algorithm
  interval_days INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_word ON user_progress(word_id);
CREATE INDEX idx_user_progress_next_review ON user_progress(next_review);
CREATE INDEX idx_user_progress_user_next_review ON user_progress(user_id, next_review);
