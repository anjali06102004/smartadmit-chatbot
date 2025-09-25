import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.error || 'Bad request');
        case 401:
          throw new Error('Unauthorized access');
        case 403:
          throw new Error('Access forbidden');
        case 404:
          throw new Error('Service not found');
        case 429:
          throw new Error('Too many requests. Please try again later.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data.error || `Error ${status}: ${error.message}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Chat Service
export const chatService = {
  // Send message to chatbot
  async sendMessage(question, context = '') {
    try {
      const startTime = Date.now();
      
      const response = await api.post('/api/chat', {
        question: question.trim(),
        context: context,
        timestamp: new Date().toISOString(),
      });

      const responseTime = Date.now() - startTime;
      
      return {
        answer: response.data.answer,
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get chat history
  async getChatHistory(limit = 50) {
    try {
      const response = await api.get('/api/chat/history', {
        params: { limit }
      });
      return response.data.history || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  },

  // Clear chat history
  async clearChatHistory() {
    try {
      await api.delete('/api/chat/history');
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  },

  // Get suggested questions
  async getSuggestedQuestions() {
    try {
      const response = await api.get('/api/chat/suggestions');
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [
        "What are the admission requirements?",
        "Tell me about the courses offered",
        "What are the fees structure?",
        "How do I apply for admission?",
        "What are the hostel facilities?",
      ];
    }
  },

  // Rate conversation
  async rateConversation(rating, feedback = '') {
    try {
      const response = await api.post('/api/chat/rate', {
        rating,
        feedback,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Error rating conversation:', error);
      throw error;
    }
  },

  // Report issue
  async reportIssue(issue, context = '') {
    try {
      const response = await api.post('/api/chat/report', {
        issue,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      return response.data;
    } catch (error) {
      console.error('Error reporting issue:', error);
      throw error;
    }
  },
};

// Lead Service
export const leadService = {
  // Submit lead
  async submitLead(leadData) {
    try {
      const response = await api.post('/api/leads', {
        ...leadData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting lead:', error);
      throw error;
    }
  },

  // Get leads (admin only)
  async getLeads() {
    try {
      const response = await api.get('/api/leads');
      return response.data.leads || [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  // Update lead status
  async updateLead(leadId, updates) {
    try {
      const response = await api.patch(`/api/leads/${leadId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },

  // Get lead analytics
  async getLeadAnalytics() {
    try {
      const response = await api.get('/api/leads/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching lead analytics:', error);
      return {
        totalLeads: 0,
        leadsToday: 0,
        conversionRate: 0,
        sourceBreakdown: {},
        statusBreakdown: {},
      };
    }
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Export default
export default {
  chatService,
  leadService,
  healthCheck,
};