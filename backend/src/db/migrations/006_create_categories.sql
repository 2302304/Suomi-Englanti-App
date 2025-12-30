-- Create categories table (optional feature for MVP)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create word_categories junction table
CREATE TABLE IF NOT EXISTS word_categories (
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (word_id, category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_word_categories_word ON word_categories(word_id);
CREATE INDEX IF NOT EXISTS idx_word_categories_category ON word_categories(category_id);
