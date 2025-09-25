import React, { useEffect, useRef, useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, TextField, Button, CssBaseline } from '@mui/material';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { v4 as uuidv4 } from 'uuid';
import CustomThemeProvider, { useThemeContext } from './theme/ThemeProvider';
import { chatService } from './services/chatService';

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <ChatApp />
    </CustomThemeProvider>
  );
}

function ChatApp() {
  const { mode, toggleColorMode } = useThemeContext();
  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      sender: 'bot',
      text: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const conversationRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: uuidv4(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const question = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(question, '');
      const botMsg = {
        id: uuidv4(),
        sender: 'bot',
        text: response.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: uuidv4(),
        sender: 'bot',
        text: "I'm having trouble connecting to the server. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Stub voice button state toggle only (no recording here)
  const handleVoiceInput = () => setListening((v) => !v);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🎓 College Admission Assistant
          </Typography>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        ref={conversationRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: '800px',
          width: '100%',
          mx: 'auto',
          my: 2,
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              p: 2,
              borderRadius: 4,
              bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
              color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
              boxShadow: 1,
              wordBreak: 'break-word',
            }}
          >
            {msg.text}
            <Typography variant="caption" display="block" sx={{ opacity: 0.7, fontSize: '0.7rem', textAlign: 'right', mt: 0.5 }}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ alignSelf: 'flex-start', p: 2, borderRadius: 4, bgcolor: 'background.paper', display: 'flex', gap: 1, boxShadow: 1 }}>
            <Box sx={{ width: 8, height: 8, bgcolor: 'text.secondary', borderRadius: '50%', opacity: 0.6 }} />
            <Box sx={{ width: 8, height: 8, bgcolor: 'text.secondary', borderRadius: '50%', opacity: 0.6 }} />
            <Box sx={{ width: 8, height: 8, bgcolor: 'text.secondary', borderRadius: '50%', opacity: 0.6 }} />
          </Box>
        )}
      </Box>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: 'sticky', bottom: 0, zIndex: 1000 }}
      >
        <Box sx={{ display: 'flex', gap: 1, maxWidth: '800px', mx: 'auto', width: '100%' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            InputProps={{
              sx: {
                borderRadius: 4,
                bgcolor: 'background.paper',
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              },
            }}
            multiline
            maxRows={4}
          />
          <Button variant="contained" color="primary" onClick={sendMessage} disabled={!input.trim()} sx={{ minWidth: '48px', width: '48px', height: '48px', borderRadius: '50%', p: 0 }}>
            <SendIcon />
          </Button>
          <Button variant="contained" color={listening ? 'error' : 'primary'} aria-label={listening ? 'Stop listening' : 'Start voice input'} onClick={handleVoiceInput} sx={{ minWidth: '48px', width: '48px', height: '48px', borderRadius: '50%', p: 0 }}>
            {listening ? <MicOffIcon /> : <MicIcon />}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
