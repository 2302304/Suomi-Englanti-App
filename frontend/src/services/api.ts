import axios from 'axios';
import type { AuthResponse, Word, WordWithSentences, ProgressStats, PracticeResult } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};

// Words API
export const wordsAPI = {
  getAll: async (page = 1, limit = 50) => {
    const response = await api.get('/api/words', { params: { page, limit } });
    return response.data;
  },

  getById: async (id: number): Promise<WordWithSentences> => {
    const response = await api.get<WordWithSentences>(`/api/words/${id}`);
    return response.data;
  },

  search: async (query: string) => {
    const response = await api.get('/api/words/search/query', { params: { q: query } });
    return response.data;
  },

  getRandomCard: async (): Promise<{ word: Word }> => {
    const response = await api.get<{ word: Word }>('/api/words/random/card');
    return response.data;
  },

  getReviewDue: async (limit = 20) => {
    const response = await api.get('/api/words/review/due', { params: { limit } });
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  submitResult: async (result: PracticeResult) => {
    const response = await api.post('/api/progress', result);
    return response.data;
  },

  getStats: async (): Promise<ProgressStats> => {
    const response = await api.get<ProgressStats>('/api/progress/stats');
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/api/progress/dashboard');
    return response.data;
  },
};

export default api;
