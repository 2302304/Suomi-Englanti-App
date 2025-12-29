import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wordsAPI } from '../services/api';
import type { Word } from '../types';

export default function Dictionary() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (searchQuery) {
      searchWords();
    } else {
      loadWords();
    }
  }, [page, searchQuery]);

  const loadWords = async () => {
    setLoading(true);
    try {
      const response = await wordsAPI.getAll(page, 50);
      setWords(response.words);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load words:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchWords = async () => {
    if (searchQuery.length < 2) return;
    setLoading(true);
    try {
      const response = await wordsAPI.search(searchQuery);
      setWords(response.words);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    searchWords();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Dictionary</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              className="input text-lg"
              placeholder="Search words in English or Finnish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((word) => (
                <div key={word.id} className="card hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg text-gray-800">
                      {word.english}
                    </div>
                    {word.frequency_rank && (
                      <div className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        #{word.frequency_rank}
                      </div>
                    )}
                  </div>
                  <div className="text-primary-600 font-medium">
                    {word.finnish}
                  </div>
                  {word.word_class && (
                    <div className="text-sm text-gray-500 mt-2 italic">
                      {word.word_class}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!searchQuery && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
