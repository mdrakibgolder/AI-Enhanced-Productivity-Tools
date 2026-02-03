import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// AI Service
export const aiService = {
  // AI Chat - Productivity Coach
  chat: (message) => api.post('/ai/chat', { message }),
  
  // Get AI-powered smart suggestions
  getSmartSuggestions: () => api.get('/ai/smart-suggestions'),
  
  // Get AI-powered daily plan
  getSmartDailyPlan: () => api.get('/ai/smart-daily-plan'),
  
  // Analyze task with AI
  analyzeTask: (task) => api.post('/ai/analyze-task-ai', task),
  
  // Parse natural language task
  parseTask: (input) => api.post('/ai/parse-task', { input }),
  
  // Summarize note with AI
  summarizeNote: (content) => api.post('/ai/summarize-note', { content }),
  
  // Get AI productivity insights
  getAIInsights: () => api.get('/ai/ai-insights'),
  
  // Legacy endpoints (rule-based fallback)
  getSuggestions: () => api.get('/ai/suggestions'),
  getDailyPlan: () => api.get('/ai/daily-plan'),
  getMotivation: () => api.get('/ai/motivation')
};

export default api;
