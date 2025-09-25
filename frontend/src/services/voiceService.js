import React from 'react';
// Voice Service for Speech Recognition and Text-to-Speech
class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.voices = [];
    this.currentVoice = null;
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;
    
    this.initializeSpeechRecognition();
    this.initializeVoices();
  }

  // Initialize Speech Recognition
  initializeSpeechRecognition() {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Event listeners
    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStart) this.onStart();
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResult) {
        this.onResult({
          final: finalTranscript,
          interim: interimTranscript,
          confidence: event.results[0]?.confidence || 0,
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      
      if (this.onError) {
        this.onError({
          error: event.error,
          message: this.getErrorMessage(event.error),
        });
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };
  }

  // Initialize Voices for Text-to-Speech
  initializeVoices() {
    const loadVoices = () => {
      this.voices = this.synthesis.getVoices();
      
      // Find a good default voice (prefer English)
      this.currentVoice = this.voices.find(voice => 
        voice.lang.startsWith('en') && voice.localService
      ) || this.voices.find(voice => 
        voice.lang.startsWith('en')
      ) || this.voices[0];
    };

    // Load voices immediately if available
    loadVoices();

    // Also load when voices change (some browsers load them asynchronously)
    this.synthesis.onvoiceschanged = loadVoices;
  }

  // Get error message for speech recognition errors
  getErrorMessage(error) {
    const errorMessages = {
      'no-speech': 'No speech was detected. Please try again.',
      'audio-capture': 'Audio capture failed. Please check your microphone.',
      'not-allowed': 'Microphone access denied. Please allow microphone access.',
      'network': 'Network error occurred. Please check your connection.',
      'service-not-allowed': 'Speech recognition service not allowed.',
      'bad-grammar': 'Grammar error in speech recognition.',
      'language-not-supported': 'Language not supported.',
    };

    return errorMessages[error] || `Speech recognition error: ${error}`;
  }

  // Start listening for speech
  startListening(language = 'en-US') {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.lang = language;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      throw new Error('Failed to start speech recognition');
    }
  }

  // Stop listening for speech
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Speak text using Text-to-Speech
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      // Stop any current speech
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      utterance.voice = options.voice || this.currentVoice;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.lang || 'en-US';

      // Event listeners
      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        console.error('Text-to-speech error:', event.error);
        reject(new Error(`Text-to-speech error: ${event.error}`));
      };

      // Start speaking
      this.synthesis.speak(utterance);
    });
  }

  // Stop current speech
  stopSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Get available voices
  getVoices() {
    return this.voices;
  }

  // Set voice for Text-to-Speech
  setVoice(voiceIndex) {
    if (voiceIndex >= 0 && voiceIndex < this.voices.length) {
      this.currentVoice = this.voices[voiceIndex];
    }
  }

  // Set language for Speech Recognition
  setLanguage(language) {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Check if text-to-speech is supported
  isTextToSpeechSupported() {
    return !!window.speechSynthesis;
  }

  // Get current status
  getStatus() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      speechRecognitionSupported: this.isSpeechRecognitionSupported(),
      textToSpeechSupported: this.isTextToSpeechSupported(),
      currentVoice: this.currentVoice?.name || 'Default',
      availableVoices: this.voices.length,
    };
  }

  // Set event callbacks
  setCallbacks({ onResult, onError, onStart, onEnd }) {
    this.onResult = onResult;
    this.onError = onError;
    this.onStart = onStart;
    this.onEnd = onEnd;
  }

  // Clean up resources
  destroy() {
    this.stopListening();
    this.stopSpeaking();
    
    if (this.recognition) {
      this.recognition.onstart = null;
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
    }
  }
}

// Create singleton instance
const voiceService = new VoiceService();

// React Hook for Voice Service
export const useVoice = () => {
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    voiceService.setCallbacks({
      onStart: () => {
        setIsListening(true);
        setError(null);
      },
      onEnd: () => {
        setIsListening(false);
      },
      onResult: (result) => {
        setTranscript(result.final || result.interim);
      },
      onError: (error) => {
        setError(error.message);
        setIsListening(false);
      },
    });

    return () => {
      voiceService.destroy();
    };
  }, []);

  const startListening = (language = 'en-US') => {
    try {
      voiceService.startListening(language);
    } catch (error) {
      setError(error.message);
    }
  };

  const stopListening = () => {
    voiceService.stopListening();
  };

  const speak = async (text, options = {}) => {
    try {
      setIsSpeaking(true);
      await voiceService.speak(text, options);
      setIsSpeaking(false);
    } catch (error) {
      setIsSpeaking(false);
      setError(error.message);
    }
  };

  const stopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported: voiceService.isSpeechRecognitionSupported() && voiceService.isTextToSpeechSupported(),
    getVoices: () => voiceService.getVoices(),
    setVoice: (index) => voiceService.setVoice(index),
    clearTranscript: () => setTranscript(''),
    clearError: () => setError(null),
  };
};

export default voiceService;