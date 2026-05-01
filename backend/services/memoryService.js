const fs = require('fs');
const path = require('path');

class MemoryService {
  constructor() {
    this.memoryFile = path.join(__dirname, '..', 'data', 'conversations.json');
    this.conversations = new Map();
    this.loadConversations();
  }

  // Load conversations from file
  loadConversations() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const data = fs.readFileSync(this.memoryFile, 'utf8');
        const conversations = JSON.parse(data);
        this.conversations = new Map(Object.entries(conversations));
        console.log(` Loaded ${this.conversations.size} conversations from memory`);
      }
    } catch (error) {
      console.error(' Error loading conversations:', error);
      this.conversations = new Map();
    }
  }

  // Save conversations to file
  saveConversations() {
    try {
      const data = Object.fromEntries(this.conversations);
      fs.writeFileSync(this.memoryFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error saving conversations:', error);
    }
  }

  // Get or create conversation for a session
  getConversation(sessionId) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        id: sessionId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        metadata: {
          totalMessages: 0,
          userQuestions: 0,
          botResponses: 0
        }
      });
    }
    return this.conversations.get(sessionId);
  }

  // Add message to conversation
  addMessage(sessionId, message) {
    const conversation = this.getConversation(sessionId);
    
    const messageWithId = {
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(messageWithId);
    conversation.lastActivity = new Date().toISOString();
    
    // Update metadata
    conversation.metadata.totalMessages++;
    if (message.sender === 'user') {
      conversation.metadata.userQuestions++;
    } else {
      conversation.metadata.botResponses++;
    }

    // Keep only last 50 messages to prevent memory bloat
    if (conversation.messages.length > 50) {
      conversation.messages = conversation.messages.slice(-50);
    }

    this.saveConversations();
    return messageWithId;
  }

  // Get conversation history for context
  getConversationHistory(sessionId, limit = 10) {
    const conversation = this.getConversation(sessionId);
    return conversation.messages.slice(-limit);
  }

  // Get conversation context for RAG
  getConversationContext(sessionId) {
    const history = this.getConversationHistory(sessionId, 6);
    return history.map(msg => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp
    }));
  }

  // Clear conversation
  clearConversation(sessionId) {
    if (this.conversations.has(sessionId)) {
      this.conversations.delete(sessionId);
      this.saveConversations();
      return true;
    }
    return false;
  }

  // Get all conversations (for analytics)
  getAllConversations() {
    return Array.from(this.conversations.values());
  }

  // Get conversation statistics
  getStats() {
    const conversations = this.getAllConversations();
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.metadata.totalMessages, 0);
    const totalQuestions = conversations.reduce((sum, conv) => sum + conv.metadata.userQuestions, 0);
    const totalResponses = conversations.reduce((sum, conv) => sum + conv.metadata.botResponses, 0);

    return {
      totalConversations: conversations.length,
      totalMessages,
      totalQuestions,
      totalResponses,
      averageMessagesPerConversation: conversations.length > 0 ? Math.round(totalMessages / conversations.length) : 0
    };
  }

  // Clean up old conversations (older than 30 days)
  cleanupOldConversations() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let cleanedCount = 0;
    for (const [sessionId, conversation] of this.conversations.entries()) {
      const lastActivity = new Date(conversation.lastActivity);
      if (lastActivity < thirtyDaysAgo) {
        this.conversations.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.saveConversations();
      console.log(`🧹 Cleaned up ${cleanedCount} old conversations`);
    }

    return cleanedCount;
  }
}

module.exports = MemoryService;
