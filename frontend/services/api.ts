import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface Game {
  id: number;
  name: string;
  open_time: string;
  close_time: string;
  working_days?: number;
  created_at: string;
  last_result_reset: string | null;
  latest_result: string | null;
  open_result: string | null;
  close_result: string | null;
  status: 'live' | 'closed';
}

export interface Result {
  id: number;
  game_id: number;
  result: string;
  open_result: string | null;
  close_result: string | null;
  result_type: 'open' | 'close' | 'both';
  status: 'live' | 'closed';
  result_date: string;
  created_at: string;
  updated_at: string;
  game_name?: string;
}

// Public API
export const gamesApi = {
  getAll: () => api.get<Game[]>('/api/games'),
  getById: (id: number) => api.get<Game>(`/api/games/${id}`),
};

export const resultsApi = {
  getAll: (gameId?: number) => {
    const params = gameId ? { game_id: gameId } : {};
    return api.get<Result[]>('/api/results', { params });
  },
  getByGameId: (gameId: number) => api.get<Result[]>(`/api/results/${gameId}`),
};

// Admin Auth API
export const authApi = {
  login: (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/api/admin/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  getMe: () => api.get('/api/admin/me'),
};

// Admin API
export const adminApi = {
  // Games
  createGame: (data: { name: string; open_time: string; close_time: string; working_days?: number }) => 
    api.post<Game>('/api/admin/games', data),
  updateGame: (id: number, data: { name?: string; open_time?: string; close_time?: string; working_days?: number }) =>
    api.put<Game>(`/api/admin/games/${id}`, data),
  deleteGame: (id: number) => api.delete(`/api/admin/games/${id}`),
  
  // Results
  createResult: (data: { game_id: number; result: string; result_date: string; status: string; result_type: string }) =>
    api.post<Result>('/api/admin/results', data),
  updateResult: (id: number, data: { result?: string; status?: string; result_type?: string }) =>
    api.put<Result>(`/api/admin/results/${id}`, data),
  deleteResult: (id: number) => api.delete(`/api/admin/results/${id}`),
};

export default api;
