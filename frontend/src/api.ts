import axios from 'axios';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RepositoryRequest {
  owner: string;
  repo: string;
  generate_summary?: boolean;
  generate_guide?: boolean;
}

export interface AnalysisResponse {
  status: string;
  data?: any;
  error?: string;
}

export interface UserSignUp {
  email: string;
  username: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    username: string;
    created_at: string;
  };
}

export interface RepositoryComparison {
  owner1: string;
  repo1: string;
  owner2: string;
  repo2: string;
}

// Analysis endpoints
export const analyzeRepository = (request: RepositoryRequest) =>
  api.post<AnalysisResponse>('/analyze', request);

export const getAnalysisHistory = (limit = 10, skip = 0) =>
  api.get('/history', { params: { limit, skip } });

export const getAnalysis = (owner: string, repo: string) =>
  api.get<AnalysisResponse>(`/analysis/${owner}/${repo}`);

// Authentication endpoints
export const signup = (userData: UserSignUp) =>
  api.post<TokenResponse>('/auth/signup', userData);

export const login = (loginData: UserLogin) =>
  api.post<TokenResponse>('/auth/login', loginData);

export const getMe = () =>
  api.get('/auth/me');

// Comparison endpoint
export const compareRepositories = (request: RepositoryComparison) =>
  api.post<AnalysisResponse>('/compare', request);

// PDF export
export const exportPDF = (owner: string, repo: string) =>
  api.get(`/export/pdf/${owner}/${repo}`, { responseType: 'blob' });

// Trending endpoints
export const getTrending = (language = '') =>
  api.get('/trending', { params: { language } });

export const getTrendingByLanguage = (language: string) =>
  api.get(`/trending/${language}`);

export const healthCheck = () => api.get('/health');
