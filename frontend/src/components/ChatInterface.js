import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Fab,
  Tooltip,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Clear as ClearIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';

import { useChat } from '../context/ChatContext';
import { useLead } from '../context/LeadContext';
import { useVoice } from '../services/voiceService';
import { chatService } from '../services/chatService';

// Import child components
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import QuickActions from './QuickActions';
import LeadForm from './LeadForm';
import VoiceIndicator from './VoiceIndicator';
import SuggestedQuestions from './SuggestedQuestions';
import TypingIndicator from './TypingIndicator';
import ChatSettings from './ChatSettings';

const ChatInterface = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Context hooks
  const {
    messages,
    isTyping,
    voiceEnabled,
    autoSpeak,
    addMessage,
    setTyping,
    clearMessages,
    getConversationContext,
    updateAnalytics,
  } = useChat();
  
  const {
    showLeadForm,
    checkLeadTriggers,
  } = useLead();

  // Voice hook
  const {
    isListening,
    isSpeaking,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported: voiceSupported,
    clearTranscript,
  } = useVoice();

  // Local state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(0);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load suggested questions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const suggestions = await chatService.getSuggestedQuestions();
        setSuggestedQuestions(suggestions);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }
    };
    loadSuggestions();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      handleSendMessage(transcript);
      clearTranscript();
    }
  }, [transcript, isListening]);

  // Auto-speak bot responses if enabled
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot' && !isSpeaking) {
        speak(lastMessage.text);
      }
    }
  }, [messages, autoSpeak, speak, isSpeaking]);

  // Check lead form triggers
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const timeSpent = Date.now() - sessionStartTime;
      
      if (lastMessage.sender === 'user') {
        checkLeadTriggers(lastMessage.text, messageCount, timeSpent);
      }
    }
  }, [messages, messageCount, sessionStartTime, checkLeadTriggers]);

  // Handle sending messages
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      text: text.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setMessageCount(prev => prev + 1);
    setTyping(true);

    try {
      // Get conversation context for RAG
      const context = getConversationContext();
      
      // Send to backend
      const startTime = Date.now();
      const response = await chatService.sendMessage(text, context);
      const responseTime = Date.now() - startTime;

      // Add bot response
      const botMessage = {
        text: response.answer,
        sender: 'bot',
        timestamp: response.timestamp,
        responseTime,
      };

      addMessage(botMessage);
      
      // Update analytics
      updateAnalytics({
        averageResponseTime: responseTime / 1000, // Convert to seconds
      });

      // Show quick actions for certain responses
      if (response.answer.toLowerCase().includes('contact') || 
          response.answer.toLowerCase().includes('apply') ||
          response.answer.toLowerCase().includes('admission')) {
        setShowQuickActions(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true,
      };

      addMessage(errorMessage);
    } finally {
      setTyping(false);
    }
  };

  // Handle voice toggle
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) {
        stopSpeaking();
      }
      startListening();
    }
  };

  // Handle suggested question click
  const handleSuggestionClick = (question) => {
    handleSendMessage(question);
  };

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    switch (action) {
      case 'call':
        window.open('tel:+1-555-123-4568', '_self');
        break;
      case 'email':
        window.open('mailto:admissions@college.edu', '_self');
        break;
      case 'brochure':
        handleSendMessage('I would like to download the college brochure');
        break;
      case 'apply':
        handleSendMessage('I want to apply for admission');
        break;
      default:
        break;
    }
    setShowQuickActions(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
        {/* Main Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Paper
            elevation={8}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: 'background.paper',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              minHeight: { xs: 'calc(100vh - 32px)', md: 'calc(100vh - 64px)' },
            }}
          >
            {/* Chat Header */}
            <ChatHeader
              onSettingsClick={() => setSettingsOpen(true)}
              onClearClick={clearMessages}
              messageCount={messages.length}
              isConnected={true}
            />

            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Suggested Questions (shown when no messages) */}
              {messages.length === 0 && (
                <SuggestedQuestions
                  questions={suggestedQuestions}
                  onQuestionClick={handleSuggestionClick}
                />
              )}

              {/* Message List */}
              <MessageList
                messages={messages}
                isTyping={isTyping}
                messagesEndRef={messagesEndRef}
              />

              {/* Typing Indicator */}
              {isTyping && <TypingIndicator />}

              {/* Voice Indicator */}
              <AnimatePresence>
                {(isListening || isSpeaking) && (
                  <VoiceIndicator
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    transcript={transcript}
                  />
                )}
              </AnimatePresence>
            </Box>

            {/* Quick Actions */}
            <AnimatePresence>
              {showQuickActions && (
                <QuickActions
                  onAction={handleQuickAction}
                  onClose={() => setShowQuickActions(false)}
                />
              )}
            </AnimatePresence>

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              voiceEnabled={voiceEnabled && voiceSupported}
              isListening={isListening}
              onVoiceToggle={handleVoiceToggle}
              placeholder="Ask me about admissions, courses, fees, and more..."
              ref={inputRef}
            />
          </Paper>
        </motion.div>

        {/* Floating Action Buttons */}
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 20, md: 30 },
            right: { xs: 20, md: 30 },
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            zIndex: 1000,
          }}
        >
          {/* Voice Toggle FAB */}
          {voiceEnabled && voiceSupported && (
            <Tooltip title={isListening ? 'Stop Listening' : 'Start Voice Input'}>
              <Fab
                color={isListening ? 'secondary' : 'primary'}
                size="medium"
                onClick={handleVoiceToggle}
                sx={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </Fab>
            </Tooltip>
          )}

          {/* Settings FAB */}
          <Tooltip title="Settings">
            <Fab
              color="default"
              size="medium"
              onClick={() => setSettingsOpen(true)}
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'background.paper',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <SettingsIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Container>

      {/* Lead Form Modal */}
      <AnimatePresence>
        {showLeadForm && <LeadForm />}
      </AnimatePresence>

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw',
          },
        }}
      >
        <ChatSettings onClose={() => setSettingsOpen(false)} />
      </Drawer>
    </Box>
  );
};

export default ChatInterface;