const express = require('express');
const router = express.Router();
const { getAnswerWithRAG } = require('../rag/index');

// In-memory history store
let history = [];

router.post('/', async (req, res) => {
  console.log('Received request:', req.body);
  console.log('Content-Type:', req.get('Content-Type'));
  
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }
  
  const { question, context } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required in request body' });
  }
  
  try {
    const answer = await getAnswerWithRAG(question, context || '');

    // Save to history
    history.push({
      id: Date.now().toString(),
      question,
      answer,
      context: context || '',
      timestamp: new Date().toISOString(),
    });

    res.json({ answer });
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

module.exports = router; 