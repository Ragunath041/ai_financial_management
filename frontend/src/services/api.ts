// API Configuration and Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  return response;
};

// ==================== AUTH API ====================

export const authAPI = {
  register: async (data: { fullName: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    // Store token and user data
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    return result;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }

    // Store token and user data
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    return result;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: async () => {
    const response = await authFetch('/auth/me');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get user');
    }

    return result.user;
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ==================== FINANCIAL DATA API ====================

export const financialAPI = {
  createOrUpdate: async (data: {
    salary: string;
    rent: string;
    food: string;
    travel: string;
    others: string;
    savingsGoal: string;
    jobType: string;
    city: string;
    area: string;
    rentBudget: string;
  }) => {
    const response = await authFetch('/financial-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save financial data');
    }

    return result;
  },

  get: async () => {
    const response = await authFetch('/financial-data');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get financial data');
    }

    return result.data;
  },
};

// ==================== ANALYSIS API ====================

export const analysisAPI = {
  getDashboard: async () => {
    const response = await authFetch('/analysis/dashboard');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get dashboard data');
    }

    return result;
  },

  getInsights: async () => {
    const response = await authFetch('/analysis/insights');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get insights');
    }

    return result.insights;
  },

  getExpenseTips: async () => {
    const response = await authFetch('/analysis/expense-tips');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get expense tips');
    }

    return result.tips;
  },

  getSavingsProjection: async () => {
    const response = await authFetch('/analysis/savings-projection');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get savings projection');
    }

    return result.projection;
  },

  getLocationRecommendations: async () => {
    const response = await authFetch('/analysis/location-recommendations');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get location recommendations');
    }

    return result;
  },

  getAIInsights: async () => {
    const response = await authFetch('/analysis/ai-insights');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get AI insights');
    }

    return result;
  },
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  const result = await response.json();
  return result;
};
