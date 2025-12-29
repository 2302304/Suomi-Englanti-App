import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './index';

const migrations = [
  '001_create_users.sql',
  '002_create_words.sql',
  '003_create_sentences.sql',
  '004_create_word_sentences.sql',
  '005_create_user_progress.sql',
  '006_create_categories.sql',
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    for (const migration of migrations) {
      const filePath = join(__dirname, 'migrations', migration);
      const sql = readFileSync(filePath, 'utf-8');

      console.log(`📝 Running migration: ${migration}`);
      await pool.query(sql);
      console.log(`✅ Completed: ${migration}\n`);
    }

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
