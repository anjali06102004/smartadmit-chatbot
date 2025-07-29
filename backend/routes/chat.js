const express = require('express');
const router = express.Router();
const { getAnswerWithRAG } = require('../rag/index');

router.post('/', async (req, res) => {
  console.log('Received request:', req.body);
  console.log('Content-Type:', req.get('Content-Type'));
  
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }
  
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required in request body' });
  }
  
  try {
    const answer = await getAnswerWithRAG(question);
    res.json({ answer });
  } catch (err) {
    console.error('Error in chat route:', err);
    res.status(500).json({ error: 'Error generating answer', details: err.message });
  }
});

module.exports = router; 