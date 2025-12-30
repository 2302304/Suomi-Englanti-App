-- Create sentences table
CREATE TABLE IF NOT EXISTS sentences (
  id SERIAL PRIMARY KEY,
  english_sentence TEXT NOT NULL,
  finnish_sentence TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for difficulty-based queries
CREATE INDEX IF NOT EXISTS idx_sentences_difficulty ON sentences(difficulty_level);
