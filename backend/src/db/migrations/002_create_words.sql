-- Enable pg_trgm extension for fuzzy search (must be first)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create words table
CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  english VARCHAR(255) NOT NULL,
  finnish VARCHAR(255) NOT NULL,
  word_class VARCHAR(50),  -- noun, verb, adjective, etc.
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  frequency_rank INTEGER,  -- 1-2000 (most common words)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_words_english ON words(english);
CREATE INDEX IF NOT EXISTS idx_words_finnish ON words(finnish);
CREATE INDEX IF NOT EXISTS idx_words_frequency ON words(frequency_rank);
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty_level);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_words_english_trgm ON words USING gin(english gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_words_finnish_trgm ON words USING gin(finnish gin_trgm_ops);
