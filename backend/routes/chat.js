const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const { getAnswerWithRAG, getRAGStats } = require('../rag/index');
const MemoryService = require('../services/memoryService');
const AIService = require('../services/aiService');

// Initialize services
const memoryService = new MemoryService();
const aiService = new AIService();

// Legacy history store (for backward compatibility)
let history = [];

// Chat endpoint
router.post('/', async (req, res) => {
  console.log('Received request:', req.body);
  
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const { question, context, sessionId } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required in request body' });
  }

  // Generate session ID if not provided
  const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Get conversation history for context using memory service
    const conversationHistory = memoryService.getConversationContext(currentSessionId);
    
    // Step 1: Try RAG (vector knowledge base)
    const ragResult = await getAnswerWithRAG(question, conversationHistory);
    
    let answer, sources = [], confidence = 0;
    
    // Step 2: Check if RAG gave a good answer (confidence > 0.3)
    if (ragResult.confidence > 0.3) {
      answer = ragResult.answer;
      sources = ragResult.sources;
      confidence = ragResult.confidence;
      console.log(` RAG answer used (confidence: ${confidence})`);
    } else {
      // Step 3: Fallback to OpenAI with conversation context
      console.log('⚠️ RAG confidence low, using OpenAI fallback...');
      
      try {
        const historyContext = conversationHistory
          .map(msg => `${msg.sender === 'user' ? 'Student' : 'Assistant'}: ${msg.text}`)
          .join('\n');
        
        const systemPrompt = `You are a helpful college assistant. Answer student questions about admissions, courses, fees, facilities, and college life. Be friendly, accurate, and helpful.

${historyContext ? `Previous conversation:\n${historyContext}\n` : ''}

If you don't know specific details, suggest contacting the relevant department.`;

        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
        
        answer = response.choices[0].message.content;
        sources = ['OpenAI Fallback'];
        confidence = 0.8; // High confidence for OpenAI responses
      } catch (openaiError) {
        // Final fallback to basic response
        console.log('⚠️ OpenAI quota exceeded, using basic fallback');
        answer = "I'm currently experiencing technical difficulties with our AI system. Please contact the college directly for assistance:\n\n📞 Main office: +1-555-123-4567\n📧 Email: info@college.edu\n🌐 Website: www.college.edu";
        sources = ['System Fallback'];
        confidence = 0.5;
      }
    }

    // Step 4: Save to memory service
    const userMessage = memoryService.addMessage(currentSessionId, {
      sender: 'user',
      text: question,
      context: context || ''
    });

    const botMessage = memoryService.addMessage(currentSessionId, {
      sender: 'bot',
      text: answer,
      sources,
      confidence
    });

    // Also save to legacy history for backward compatibility
    const entry = {
      id: Date.now().toString(),
      question,
      answer,
      sources,
      confidence,
      context: context || '',
      timestamp: new Date().toISOString(),
    };
    history.push(entry);

    res.json({ 
      answer, 
      sources, 
      confidence,
      timestamp: botMessage.timestamp,
      sessionId: currentSessionId,
      messageId: botMessage.id
    });
  } catch (err) {
    console.error('Error in chat route:', err);
    res.status(500).json({ error: 'Error generating answer', details: err.message });
  }
});

// Get chat history
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  res.json({ history: history.slice(-limit) });
});

// Clear chat history
router.delete('/history', (req, res) => {
  history = [];
  res.json({ success: true });
});

// Get suggested questions
router.get('/suggestions', (req, res) => {
  res.json({
    suggestions: [
      'What are the admission requirements?',
      'Tell me about the courses offered',
      'What is the fee structure?',
      'How do I apply for admission?',
      'What are the hostel facilities?'
    ]
  });
});

// Rate conversation
router.post('/rate', (req, res) => {
  const { rating, feedback } = req.body || {};
  console.log('Conversation rating:', rating, feedback);
  res.json({ success: true });
});

// Report issue
router.post('/report', (req, res) => {
  const { issue, context } = req.body || {};
  console.log('Issue reported:', issue, context);
  res.json({ success: true });
});

// Get RAG system statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getRAGStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting RAG stats:', error);
    res.status(500).json({ error: 'Failed to get RAG statistics' });
  }
});

// Get conversation history for a session
router.get('/conversation/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = memoryService.getConversationHistory(sessionId);
    res.json({ sessionId, messages: history });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation history' });
  }
});

// Clear conversation for a session
router.delete('/conversation/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const cleared = memoryService.clearConversation(sessionId);
    res.json({ success: cleared, sessionId });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});

// Get memory service statistics
router.get('/memory/stats', (req, res) => {
  try {
    const stats = memoryService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting memory stats:', error);
    res.status(500).json({ error: 'Failed to get memory statistics' });
  }
});

// Cleanup old conversations
router.post('/memory/cleanup', (req, res) => {
  try {
    const cleanedCount = memoryService.cleanupOldConversations();
    res.json({ success: true, cleanedCount });
  } catch (error) {
    console.error('Error cleaning up conversations:', error);
    res.status(500).json({ error: 'Failed to cleanup conversations' });
  }
});

// Get AI service statistics
router.get('/ai-stats', (req, res) => {
  try {
    const stats = aiService.getPerformanceStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting AI stats:', error);
    res.status(500).json({ error: 'Failed to get AI statistics' });
  }
});

// Reset circuit breakers
router.post('/reset-circuit-breakers', (req, res) => {
  try {
    aiService.resetCircuitBreakers();
    res.json({ success: true, message: 'Circuit breakers reset successfully' });
  } catch (error) {
    console.error('Error resetting circuit breakers:', error);
    res.status(500).json({ error: 'Failed to reset circuit breakers' });
  }
});

// Test AI models
router.post('/test-models', async (req, res) => {
  try {
    const { question } = req.body;
    const testQuestion = question || 'Hello, how are you?';
    
    const response = await aiService.generateResponse(testQuestion, 'Test context');
    res.json({ 
      success: true, 
      response,
      message: 'Model test completed successfully' 
    });
  } catch (error) {
    console.error('Error testing models:', error);
    res.status(500).json({ error: 'Failed to test AI models' });
  }
});

module.exports = router;
