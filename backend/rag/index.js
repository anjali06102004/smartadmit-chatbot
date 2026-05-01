const VectorRAG = require('./vectorRAG');
require('dotenv').config();

// Initialize the vector RAG system
const vectorRAG = new VectorRAG();

// Initialize the system on startup
let isInitialized = false;

async function initializeRAG() {
  if (!isInitialized) {
    console.log('Initializing RAG system...');
    isInitialized = await vectorRAG.initialize();
    if (isInitialized) {
      console.log(' RAG system initialized successfully');
    } else {
      console.log(' Failed to initialize RAG system');
    }
  }
  return isInitialized;
}

async function getAnswerWithRAG(question, conversationHistory = []) {
  try {
    // Ensure RAG is initialized
    const initialized = await initializeRAG();
    
    if (!initialized) {
      // Fallback to basic response if RAG fails
      return {
        answer: "I'm currently having technical difficulties. Please contact the college directly for assistance.",
        sources: [],
        confidence: 0
      };
    }

    // Use vector RAG to generate answer
    const result = await vectorRAG.generateAnswer(question, conversationHistory);
    
    console.log(`RAG Response - Confidence: ${result.confidence}, Sources: ${result.sources.length}`);
    
    return result;
  } catch (error) {
    console.error(' RAG Error:', error);
    return {
      answer: "I'm sorry, I encountered an error while processing your question. Please try again or contact the college directly.",
      sources: [],
      confidence: 0
    };
  }
}

// Get RAG system statistics
async function getRAGStats() {
  try {
    const initialized = await initializeRAG();
    if (!initialized) return { status: 'not_initialized' };
    
    return await vectorRAG.getStats();
  } catch (error) {
    console.error(' Error getting RAG stats:', error);
    return { status: 'error', error: error.message };
  }
}

module.exports = { 
  getAnswerWithRAG, 
  getRAGStats,
  initializeRAG 
};