-- Create word_sentences junction table
CREATE TABLE IF NOT EXISTS word_sentences (
  id SERIAL PRIMARY KEY,
  word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  sentence_id INTEGER NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
  UNIQUE(word_id, sentence_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_word_sentences_word ON word_sentences(word_id);
CREATE INDEX IF NOT EXISTS idx_word_sentences_sentence ON word_sentences(sentence_id);
