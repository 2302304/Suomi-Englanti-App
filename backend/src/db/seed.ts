import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './index';

interface WordData {
  english: string;
  finnish: string;
  frequency_rank?: number;
}

interface SentenceData {
  english_sentence: string;
  finnish_sentence: string;
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Check if database is already seeded
    const result = await pool.query('SELECT COUNT(*) FROM words');
    const wordCount = parseInt(result.rows[0].count);

    if (wordCount > 0) {
      console.log(`✅ Database already seeded with ${wordCount} words. Skipping seed.\n`);
      return;
    }

    // Load seed data
    const wordsPath = join(__dirname, 'seeds/001_words.json');
    const sentencesPath = join(__dirname, 'seeds/002_sentences.json');

    console.log('📖 Reading seed files...');
    const words: WordData[] = JSON.parse(readFileSync(wordsPath, 'utf-8'));
    const sentences: SentenceData[] = JSON.parse(readFileSync(sentencesPath, 'utf-8'));

    console.log(`✅ Loaded ${words.length} words`);
    console.log(`✅ Loaded ${sentences.length} sentences\n`);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await pool.query('TRUNCATE words, sentences, word_sentences RESTART IDENTITY CASCADE');
    console.log('✅ Cleared\n');

    // Insert words
    console.log('📝 Inserting words...');
    for (const word of words) {
      await pool.query(
        'INSERT INTO words (english, finnish, frequency_rank) VALUES ($1, $2, $3)',
        [word.english, word.finnish, word.frequency_rank || null]
      );
    }
    console.log(`✅ Inserted ${words.length} words\n`);

    // Insert sentences
    console.log('📝 Inserting sentences...');
    for (const sentence of sentences) {
      await pool.query(
        'INSERT INTO sentences (english_sentence, finnish_sentence) VALUES ($1, $2)',
        [sentence.english_sentence, sentence.finnish_sentence]
      );
    }
    console.log(`✅ Inserted ${sentences.length} sentences\n`);

    // Link words to sentences (find words that appear in sentences)
    console.log('🔗 Linking words to sentences...');
    const wordsResult = await pool.query('SELECT id, english FROM words');
    const sentencesResult = await pool.query('SELECT id, english_sentence FROM sentences');

    let linkCount = 0;
    for (const word of wordsResult.rows) {
      const wordLower = word.english.toLowerCase();
      const wordRegex = new RegExp(`\\b${wordLower}\\b`, 'i');

      for (const sentence of sentencesResult.rows) {
        if (wordRegex.test(sentence.english_sentence)) {
          try {
            await pool.query(
              'INSERT INTO word_sentences (word_id, sentence_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [word.id, sentence.id]
            );
            linkCount++;
          } catch (error) {
            // Ignore duplicate key errors
          }
        }
      }
    }
    console.log(`✅ Created ${linkCount} word-sentence links\n`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
