import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wordsAPI, progressAPI } from '../services/api';
import type { Word } from '../types';

export default function Practice() {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'fi-to-en' | 'en-to-fi'>('en-to-fi');
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  useEffect(() => {
    loadNextWord();
  }, []);

  const loadNextWord = async () => {
    setLoading(true);
    setShowAnswer(false);
    setUserAnswer('');
    try {
      const response = await wordsAPI.getRandomCard();
      setCurrentWord(response.word);
    } catch (error) {
      console.error('Failed to load word:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAnswer(true);
  };

  const handleResult = async (correct: boolean) => {
    if (!currentWord) return;

    try {
      await progressAPI.submitResult({
        word_id: currentWord.id,
        correct,
      });

      setSessionStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
        total: prev.total + 1,
      }));

      loadNextWord();
    } catch (error) {
      console.error('Failed to submit result:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading next word...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDirection(direction === 'en-to-fi' ? 'fi-to-en' : 'en-to-fi')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
            >
              {direction === 'en-to-fi' ? '🇬🇧 → 🇫🇮' : '🇫🇮 → 🇬🇧'}
            </button>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">
                ✓ {sessionStats.correct}
              </span>
              <span className="text-red-600 font-medium">
                ✗ {sessionStats.incorrect}
              </span>
              <span className="text-gray-600">
                Total: {sessionStats.total}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card">
          {!showAnswer ? (
            <div>
              <div className="text-center mb-8">
                <div className="text-sm text-gray-500 mb-2">
                  {direction === 'en-to-fi' ? 'Translate to Finnish' : 'Käännä englanniksi'}
                </div>
                <div className="text-5xl font-bold text-gray-800">
                  {direction === 'en-to-fi' ? currentWord?.english : currentWord?.finnish}
                </div>
                {currentWord?.word_class && (
                  <div className="text-sm text-gray-500 mt-2 italic">
                    ({currentWord.word_class})
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  className="input text-lg text-center"
                  placeholder="Type your answer..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary w-full text-lg">
                  Check Answer
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Reveal answer
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <div className="text-sm text-gray-500 mb-2">
                  {direction === 'en-to-fi' ? 'English' : 'Suomi'}:
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-4">
                  {direction === 'en-to-fi' ? currentWord?.english : currentWord?.finnish}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {direction === 'en-to-fi' ? 'Finnish' : 'English'}:
                </div>
                <div className="text-2xl text-primary-600 font-medium">
                  {direction === 'en-to-fi' ? currentWord?.finnish : currentWord?.english}
                </div>
                {currentWord?.word_class && (
                  <div className="text-sm text-gray-500 mt-2 italic">
                    ({currentWord.word_class})
                  </div>
                )}
              </div>

              {userAnswer && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                  <div className="text-sm text-gray-600">Your answer:</div>
                  <div className="text-lg font-medium">{userAnswer}</div>
                </div>
              )}

              <div className="text-center mb-6">
                <p className="text-gray-600">Did you get it right?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleResult(false)}
                  className="btn btn-danger text-lg py-4"
                >
                  ✗ Incorrect
                </button>
                <button
                  onClick={() => handleResult(true)}
                  className="btn btn-success text-lg py-4"
                >
                  ✓ Correct
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Using spaced repetition algorithm to optimize your learning
          </p>
        </div>
      </div>
    </div>
  );
}
