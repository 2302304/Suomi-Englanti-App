import axios from 'axios';
import { writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/EkBass/fin-eng-translations-set/main/data-packs/fineng-json.json';

interface TranslationData {
  [key: string]: string | any;
}

interface WordEntry {
  english: string;
  finnish: string;
  frequency_rank?: number;
}

interface SentenceEntry {
  english_sentence: string;
  finnish_sentence: string;
}

async function fetchTranslations() {
  console.log('🔄 Fetching translation data from GitHub...\n');

  try {
    const response = await axios.get<TranslationData>(GITHUB_RAW_URL);
    const data = response.data;

    console.log('✅ Data fetched successfully!');
    console.log('📊 Processing data...\n');

    // Extract translation pairs from numbered fields
    const translations: { english: string; finnish: string }[] = [];
    const keys = Object.keys(data).filter((key) => !isNaN(Number(key)));

    // Assuming odd indices are English and even are Finnish (or vice versa)
    for (let i = 0; i < keys.length - 1; i += 2) {
      const first = data[keys[i]];
      const second = data[keys[i + 1]];

      if (typeof first === 'string' && typeof second === 'string') {
        // Detect which is English (usually has more Latin characters)
        const isFirstEnglish = /^[a-zA-Z\s,.!?'-]+$/.test(first.trim());
        const isSecondEnglish = /^[a-zA-Z\s,.!?'-]+$/.test(second.trim());

        if (isFirstEnglish && !isSecondEnglish) {
          translations.push({ english: first.trim(), finnish: second.trim() });
        } else if (!isFirstEnglish && isSecondEnglish) {
          translations.push({ english: second.trim(), finnish: first.trim() });
        } else {
          // Fallback: assume first is English
          translations.push({ english: first.trim(), finnish: second.trim() });
        }
      }
    }

    console.log(`📝 Found ${translations.length} translation pairs`);

    // Separate words (short) from sentences (longer)
    const words: WordEntry[] = [];
    const sentences: SentenceEntry[] = [];

    translations.forEach((item) => {
      const wordCount = item.english.split(/\s+/).length;

      if (wordCount <= 3) {
        // Consider it a word/phrase
        words.push({
          english: item.english,
          finnish: item.finnish,
        });
      } else {
        // Consider it a sentence
        sentences.push({
          english_sentence: item.english,
          finnish_sentence: item.finnish,
        });
      }
    });

    // Remove duplicates and limit to most common 2000 words
    const uniqueWords = Array.from(
      new Map(words.map((w) => [w.english.toLowerCase(), w])).values()
    ).slice(0, 2000);

    // Assign frequency ranks
    const rankedWords = uniqueWords.map((word, index) => ({
      ...word,
      frequency_rank: index + 1,
    }));

    console.log(`✅ Extracted ${rankedWords.length} unique words`);
    console.log(`✅ Extracted ${sentences.length} sentences\n`);

    // Generate seed files
    generateWordsSeed(rankedWords);
    generateSentencesSeed(sentences);

    console.log('🎉 Data processing complete!');
    console.log('\n📁 Generated files:');
    console.log('   - backend/src/db/seeds/001_words.json');
    console.log('   - backend/src/db/seeds/002_sentences.json');
    console.log('\n💡 Next steps:');
    console.log('   1. Review the generated seed files');
    console.log('   2. Run: npm run migrate');
    console.log('   3. Run: npm run seed');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Failed to fetch data:', error.message);
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

function generateWordsSeed(words: WordEntry[]) {
  const seedPath = join(__dirname, '../src/db/seeds/001_words.json');
  writeFileSync(seedPath, JSON.stringify(words, null, 2));
  console.log(`✅ Generated words seed file: ${words.length} words`);
}

function generateSentencesSeed(sentences: SentenceEntry[]) {
  const seedPath = join(__dirname, '../src/db/seeds/002_sentences.json');
  writeFileSync(seedPath, JSON.stringify(sentences, null, 2));
  console.log(`✅ Generated sentences seed file: ${sentences.length} sentences`);
}

fetchTranslations();
