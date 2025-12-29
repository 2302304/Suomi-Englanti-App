import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { progressAPI } from '../services/api';
import type { ProgressStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await progressAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">
            Language Learning
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Hi, {user.username}!</span>
            <Link to="/practice" className="btn btn-primary">
              Start Practice
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Progress</h2>
          <p className="text-gray-600">
            Keep practicing to master new words!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-sm opacity-90">Words Learned</div>
            <div className="text-4xl font-bold mt-2">
              {stats?.words_learned || 0}
            </div>
            <div className="text-sm opacity-75 mt-1">
              of {stats?.total_words || 0} total
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-sm opacity-90">Accuracy</div>
            <div className="text-4xl font-bold mt-2">{stats?.accuracy || 0}%</div>
            <div className="text-sm opacity-75 mt-1">
              {stats?.total_reviews || 0} total reviews
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-sm opacity-90">Current Streak</div>
            <div className="text-4xl font-bold mt-2">
              {stats?.current_streak || 0}
            </div>
            <div className="text-sm opacity-75 mt-1">days</div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="text-sm opacity-90">Due Today</div>
            <div className="text-4xl font-bold mt-2">
              {stats?.words_due_today || 0}
            </div>
            <div className="text-sm opacity-75 mt-1">words to review</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/practice"
                className="block p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
              >
                <div className="font-medium text-primary-700">
                  🎴 Practice Flashcards
                </div>
                <div className="text-sm text-gray-600">
                  Review words with spaced repetition
                </div>
              </Link>
              <Link
                to="/sentences"
                className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <div className="font-medium text-green-700">
                  📝 Practice Sentences
                </div>
                <div className="text-sm text-gray-600">
                  Translate complete sentences
                </div>
              </Link>
              <Link
                to="/dictionary"
                className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <div className="font-medium text-gray-700">
                  📖 Browse Dictionary
                </div>
                <div className="text-sm text-gray-600">
                  Explore all {stats?.total_words || 0} words
                </div>
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Learning Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Words Started</span>
                  <span className="font-medium">{stats?.words_started || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((stats?.words_started || 0) / (stats?.total_words || 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Words Mastered</span>
                  <span className="font-medium">{stats?.words_learned || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((stats?.words_learned || 0) / (stats?.total_words || 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
