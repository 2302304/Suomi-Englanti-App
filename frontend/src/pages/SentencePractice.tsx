import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Sentence } from '../types';

export default function SentencePractice() {
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [allSentences, setAllSentences] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'fi-to-en' | 'en-to-fi'>('en-to-fi');
  const [sessionStats, setSessionStats] = useState({
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    loadSentences();
  }, []);

  const loadSentences = async () => {
    setLoading(true);
    try {
      // Fetch all sentences
      const response = await api.get('/api/sentences');
      const sentences = response.data.sentences || [];

      if (sentences.length > 0) {
        // Shuffle sentences for variety
        const shuffled = [...sentences].sort(() => Math.random() - 0.5);
        setAllSentences(shuffled);
        setCurrentSentence(shuffled[0]);
        setSessionStats({ completed: 0, total: shuffled.length });
      }
    } catch (error) {
      console.error('Failed to load sentences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAnswer(true);
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < allSentences.length) {
      setCurrentIndex(nextIndex);
      setCurrentSentence(allSentences[nextIndex]);
      setShowAnswer(false);
      setUserAnswer('');
      setSessionStats(prev => ({ ...prev, completed: prev.completed + 1 }));
    } else {
      // Session completed
      setSessionStats(prev => ({ ...prev, completed: prev.completed + 1 }));
      setCurrentSentence(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCurrentSentence(allSentences[0]);
    setShowAnswer(false);
    setUserAnswer('');
    setSessionStats({ completed: 0, total: allSentences.length });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading sentences...</div>
      </div>
    );
  }

  if (!currentSentence) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="card text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
            <p className="text-gray-600 mb-6">
              You completed {sessionStats.completed} sentences!
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleRestart} className="btn btn-primary">
                Practice Again
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
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
            <div className="text-sm text-gray-600">
              Sentence {currentIndex + 1} of {sessionStats.total}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + (showAnswer ? 1 : 0)) / sessionStats.total) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="card">
          {!showAnswer ? (
            <div>
              <div className="text-center mb-8">
                <div className="text-sm text-gray-500 mb-4">
                  {direction === 'en-to-fi'
                    ? 'Translate this sentence to Finnish'
                    : 'Käännä tämä lause englanniksi'}
                </div>
                <div className="text-3xl font-medium text-gray-800 leading-relaxed">
                  {direction === 'en-to-fi'
                    ? currentSentence.english_sentence
                    : currentSentence.finnish_sentence}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  className="input text-lg min-h-[120px] resize-none"
                  placeholder="Write your translation here..."
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
                  Show correct answer
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <div className="text-sm text-gray-500 mb-2">
                  {direction === 'en-to-fi' ? 'English' : 'Suomi'}:
                </div>
                <div className="text-2xl font-medium text-gray-800 mb-6">
                  {direction === 'en-to-fi'
                    ? currentSentence.english_sentence
                    : currentSentence.finnish_sentence}
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  {direction === 'en-to-fi' ? 'Correct Finnish translation:' : 'Oikea englanninkielinen käännös:'}
                </div>
                <div className="text-2xl font-medium text-green-600 mb-6">
                  {direction === 'en-to-fi'
                    ? currentSentence.finnish_sentence
                    : currentSentence.english_sentence}
                </div>

                {userAnswer && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Your answer:</div>
                    <div className="text-lg font-medium text-blue-800">
                      {userAnswer}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className="btn btn-success w-full text-lg py-4"
              >
                {currentIndex + 1 < sessionStats.total ? 'Next Sentence →' : 'Complete Session'}
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Practice translating complete sentences to improve your fluency
          </p>
        </div>
      </div>
    </div>
  );
}
