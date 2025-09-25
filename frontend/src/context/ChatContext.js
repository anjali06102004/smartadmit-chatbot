import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  messages: [],
  isTyping: false,
  isListening: false,
  isSpeaking: false,
  conversationHistory: [],
  currentSession: null,
  voiceEnabled: false,
  autoSpeak: false,
  language: 'en-US',
  theme: 'light',
  user: {
    name: '',
    email: '',
    preferences: {
      voice: true,
      notifications: true,
      autoSpeak: false,
    }
  },
  analytics: {
    totalMessages: 0,
    sessionsToday: 0,
    averageResponseTime: 0,
    satisfactionScore: 0,
  }
};

// Action types
const CHAT_ACTIONS = {
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_TYPING: 'SET_TYPING',
  SET_LISTENING: 'SET_LISTENING',
  SET_SPEAKING: 'SET_SPEAKING',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  SET_VOICE_ENABLED: 'SET_VOICE_ENABLED',
  SET_AUTO_SPEAK: 'SET_AUTO_SPEAK',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_THEME: 'SET_THEME',
  SET_USER: 'SET_USER',
  UPDATE_ANALYTICS: 'UPDATE_ANALYTICS',
  START_SESSION: 'START_SESSION',
  END_SESSION: 'END_SESSION',
  LOAD_HISTORY: 'LOAD_HISTORY',
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.ADD_MESSAGE:
      const newMessage = {
        id: Date.now() + Math.random(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      
      return {
        ...state,
        messages: [...state.messages, newMessage],
        conversationHistory: [...state.conversationHistory, newMessage],
        analytics: {
          ...state.analytics,
          totalMessages: state.analytics.totalMessages + 1,
        }
      };

    case CHAT_ACTIONS.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload,
      };

    case CHAT_ACTIONS.SET_LISTENING:
      return {
        ...state,
        isListening: action.payload,
      };

    case CHAT_ACTIONS.SET_SPEAKING:
      return {
        ...state,
        isSpeaking: action.payload,
      };

    case CHAT_ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
      };

    case CHAT_ACTIONS.SET_VOICE_ENABLED:
      return {
        ...state,
        voiceEnabled: action.payload,
      };

    case CHAT_ACTIONS.SET_AUTO_SPEAK:
      return {
        ...state,
        autoSpeak: action.payload,
      };

    case CHAT_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      };

    case CHAT_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };

    case CHAT_ACTIONS.SET_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case CHAT_ACTIONS.UPDATE_ANALYTICS:
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload },
      };

    case CHAT_ACTIONS.START_SESSION:
      const sessionId = `session_${Date.now()}`;
      return {
        ...state,
        currentSession: {
          id: sessionId,
          startTime: new Date().toISOString(),
          messages: 0,
        },
        analytics: {
          ...state.analytics,
          sessionsToday: state.analytics.sessionsToday + 1,
        }
      };

    case CHAT_ACTIONS.END_SESSION:
      return {
        ...state,
        currentSession: null,
      };

    case CHAT_ACTIONS.LOAD_HISTORY:
      return {
        ...state,
        conversationHistory: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Chat provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('chatbot_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.conversationHistory) {
          dispatch({ type: CHAT_ACTIONS.LOAD_HISTORY, payload: parsed.conversationHistory });
        }
        if (parsed.user) {
          dispatch({ type: CHAT_ACTIONS.SET_USER, payload: parsed.user });
        }
        if (parsed.preferences) {
          dispatch({ type: CHAT_ACTIONS.SET_VOICE_ENABLED, payload: parsed.preferences.voice });
          dispatch({ type: CHAT_ACTIONS.SET_AUTO_SPEAK, payload: parsed.preferences.autoSpeak });
          dispatch({ type: CHAT_ACTIONS.SET_LANGUAGE, payload: parsed.preferences.language || 'en-US' });
          dispatch({ type: CHAT_ACTIONS.SET_THEME, payload: parsed.preferences.theme || 'light' });
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }

    // Start initial session
    dispatch({ type: CHAT_ACTIONS.START_SESSION });
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      const dataToSave = {
        conversationHistory: state.conversationHistory.slice(-50), // Keep last 50 messages
        user: state.user,
        preferences: {
          voice: state.voiceEnabled,
          autoSpeak: state.autoSpeak,
          language: state.language,
          theme: state.theme,
        },
        analytics: state.analytics,
      };
      localStorage.setItem('chatbot_data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [state.conversationHistory, state.user, state.voiceEnabled, state.autoSpeak, state.language, state.theme, state.analytics]);

  // Helper functions
  const addMessage = (message) => {
    dispatch({ type: CHAT_ACTIONS.ADD_MESSAGE, payload: message });
  };

  const setTyping = (isTyping) => {
    dispatch({ type: CHAT_ACTIONS.SET_TYPING, payload: isTyping });
  };

  const setListening = (isListening) => {
    dispatch({ type: CHAT_ACTIONS.SET_LISTENING, payload: isListening });
  };

  const setSpeaking = (isSpeaking) => {
    dispatch({ type: CHAT_ACTIONS.SET_SPEAKING, payload: isSpeaking });
  };

  const clearMessages = () => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_MESSAGES });
    toast.success('Chat cleared successfully');
  };

  const toggleVoice = () => {
    const newValue = !state.voiceEnabled;
    dispatch({ type: CHAT_ACTIONS.SET_VOICE_ENABLED, payload: newValue });
    toast.info(`Voice ${newValue ? 'enabled' : 'disabled'}`);
  };

  const toggleAutoSpeak = () => {
    const newValue = !state.autoSpeak;
    dispatch({ type: CHAT_ACTIONS.SET_AUTO_SPEAK, payload: newValue });
    toast.info(`Auto-speak ${newValue ? 'enabled' : 'disabled'}`);
  };

  const setLanguage = (language) => {
    dispatch({ type: CHAT_ACTIONS.SET_LANGUAGE, payload: language });
    toast.info(`Language changed to ${language}`);
  };

  const setTheme = (theme) => {
    dispatch({ type: CHAT_ACTIONS.SET_THEME, payload: theme });
    toast.info(`Theme changed to ${theme}`);
  };

  const updateUser = (userData) => {
    dispatch({ type: CHAT_ACTIONS.SET_USER, payload: userData });
  };

  const updateAnalytics = (analyticsData) => {
    dispatch({ type: CHAT_ACTIONS.UPDATE_ANALYTICS, payload: analyticsData });
  };

  const startNewSession = () => {
    dispatch({ type: CHAT_ACTIONS.START_SESSION });
  };

  const endSession = () => {
    dispatch({ type: CHAT_ACTIONS.END_SESSION });
  };

  // Get conversation context for RAG
  const getConversationContext = (limit = 5) => {
    return state.messages
      .slice(-limit * 2) // Get last N pairs of messages
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join('\n');
  };

  // Get user preferences for personalization
  const getUserPreferences = () => {
    return {
      name: state.user.name,
      email: state.user.email,
      voice: state.voiceEnabled,
      autoSpeak: state.autoSpeak,
      language: state.language,
      theme: state.theme,
    };
  };

  const value = {
    // State
    ...state,
    
    // Actions
    addMessage,
    setTyping,
    setListening,
    setSpeaking,
    clearMessages,
    toggleVoice,
    toggleAutoSpeak,
    setLanguage,
    setTheme,
    updateUser,
    updateAnalytics,
    startNewSession,
    endSession,
    
    // Helpers
    getConversationContext,
    getUserPreferences,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};