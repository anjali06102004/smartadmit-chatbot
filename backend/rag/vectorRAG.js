const fs = require('fs');
const path = require('path');
const AIService = require('../services/aiService');
require('dotenv').config();

class VectorRAG {
  constructor() {
    this.aiService = new AIService();
    this.vectorStore = null;
    this.isInitialized = false;
  }

  // Initialize vector store from file
  async initializeCollection() {
    try {
      const storePath = path.join(__dirname, '..', 'data', 'vector_store.json');
      
      if (fs.existsSync(storePath)) {
        const data = fs.readFileSync(storePath, 'utf8');
        this.vectorStore = JSON.parse(data);
        console.log('✅ Vector store loaded successfully');
        return true;
      } else {
        console.log('⚠️ No vector store found, using simple text search');
        this.vectorStore = { documents: [], embeddings: [], metadatas: [] };
        return true;
      }
    } catch (error) {
      console.error('❌ Error initializing vector store:', error);
      this.vectorStore = { documents: [], embeddings: [], metadatas: [] };
      return false;
    }
  }

  // Load and process documents from data directory
  async loadDocuments() {
    try {
      const dataDir = path.join(__dirname, '..', 'data');
      const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.txt'));
      
      if (files.length === 0) {
        throw new Error("No .txt files found in the data folder.");
      }

      const documents = [];
      for (const file of files) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Split content into chunks
        const chunks = this.chunkText(content, 800, 100);
        
        chunks.forEach((chunk, index) => {
          documents.push({
            id: `${file}-${index}`,
            content: chunk,
            metadata: {
              source: file,
              chunkIndex: index,
              totalChunks: chunks.length
            }
          });
        });
      }

      console.log(`📚 Loaded ${documents.length} document chunks`);
      return documents;
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      return [];
    }
  }

  // Chunk text into smaller pieces for better retrieval
  chunkText(text, chunkSize = 800, overlap = 100) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      start += chunkSize - overlap;
    }

    return chunks;
  }

  // Store documents in vector database
  async storeDocuments(documents) {
    try {
      if (!this.collection) {
        await this.initializeCollection();
      }

      const ids = documents.map(doc => doc.id);
      const contents = documents.map(doc => doc.content);
      const metadatas = documents.map(doc => doc.metadata);

      await this.collection.upsert({
        ids,
        documents: contents,
        metadatas
      });

      console.log(`✅ Stored ${documents.length} documents in vector database`);
      return true;
    } catch (error) {
      console.error('❌ Error storing documents:', error);
      return false;
    }
  }

  // Search for relevant documents using simple text matching
  async searchDocuments(query, limit = 5) {
    try {
      if (!this.vectorStore) {
        await this.initializeCollection();
      }

      // Simple text-based search for now
      const queryWords = query.toLowerCase().split(' ');
      const scoredDocs = [];

      for (let i = 0; i < this.vectorStore.documents.length; i++) {
        const doc = this.vectorStore.documents[i];
        const docText = doc.toLowerCase();
        
        // Calculate simple relevance score
        let score = 0;
        queryWords.forEach(word => {
          if (docText.includes(word)) {
            score += 1;
          }
        });

        if (score > 0) {
          scoredDocs.push({
            document: doc,
            metadata: this.vectorStore.metadatas[i],
            score: score / queryWords.length
          });
        }
      }

      // Sort by score and return top results
      scoredDocs.sort((a, b) => b.score - a.score);
      const topResults = scoredDocs.slice(0, limit);

      return {
        documents: topResults.map(r => r.document),
        metadatas: topResults.map(r => r.metadata),
        distances: topResults.map(r => 1 - r.score) // Convert score to distance
      };
    } catch (error) {
      console.error('❌ Error searching documents:', error);
      return { documents: [], metadatas: [], distances: [] };
    }
  }

  // Generate answer using RAG with multi-model AI service
  async generateAnswer(question, conversationHistory = []) {
    try {
      // Step 1: Search for relevant documents
      const searchResults = await this.searchDocuments(question, 5);
      
      if (searchResults.documents.length === 0) {
        return {
          answer: "I don't have specific information about that in my knowledge base. Please contact the college directly for more details.",
          sources: [],
          confidence: 0
        };
      }

      // Step 2: Prepare context from retrieved documents
      const context = searchResults.documents
        .map((doc, index) => {
          const metadata = searchResults.metadatas[index];
          const distance = searchResults.distances[index];
          return `Source: ${metadata.source}\nContent: ${doc}\nRelevance: ${(1 - distance).toFixed(2)}`;
        })
        .join('\n\n');

      // Step 3: Use multi-model AI service
      const aiResponse = await this.aiService.generateResponse(
        question,
        context,
        conversationHistory
      );

      // Step 4: Combine AI response with knowledge base sources
      const avgDistance = searchResults.distances.reduce((a, b) => a + b, 0) / searchResults.distances.length;
      const knowledgeConfidence = Math.max(0, 1 - avgDistance);
      
      // Combine AI confidence with knowledge base confidence
      const combinedConfidence = (aiResponse.confidence + knowledgeConfidence) / 2;

      return {
        answer: aiResponse.answer,
        sources: [...aiResponse.sources, ...searchResults.metadatas.map(meta => meta.source)],
        confidence: Math.round(combinedConfidence * 100) / 100,
        model: aiResponse.model,
        provider: aiResponse.provider,
        responseTime: aiResponse.responseTime
      };

    } catch (error) {
      console.error('❌ Error generating answer:', error);
      return {
        answer: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        sources: [],
        confidence: 0
      };
    }
  }

  // Rule-based answer generation as fallback
  generateRuleBasedAnswer(question, searchResults) {
    const questionLower = question.toLowerCase();
    let answer = "I found some relevant information in our knowledge base, but I'm currently unable to provide a detailed AI-generated response. Please contact the college directly for more specific information.";
    
    // Extract key information from search results
    const relevantContent = searchResults.documents.join(' ').toLowerCase();
    const sources = searchResults.metadatas.map(meta => meta.source);
    
    // Basic rule-based responses
    if (questionLower.includes('admission') || questionLower.includes('apply')) {
      if (relevantContent.includes('admission')) {
        answer = "Based on our records, the admission process typically includes: 1) Online application, 2) Document verification, 3) Entrance exam/Interview, 4) Merit list, 5) Fee payment. For current details, contact admissions at +1-555-123-4568 or admissions@college.edu.";
      }
    } else if (questionLower.includes('fee') || questionLower.includes('cost')) {
      if (relevantContent.includes('fee')) {
        answer = "Course fees range from $5500-$12000 per semester. Additional fees may include lab fee, library fee, sports fee, and development fee. Hostel fee is typically $1200 per semester. For current fee structure, contact the accounts office.";
      }
    } else if (questionLower.includes('hostel')) {
      if (relevantContent.includes('hostel')) {
        answer = "Hostel information: Fee is typically $1200 per semester, curfew at 9:00 PM, contact hostel warden at +1-555-123-4570 for more details. Rules include maintaining cleanliness and following cafeteria timings.";
      }
    } else if (questionLower.includes('course') || questionLower.includes('program')) {
      if (relevantContent.includes('course')) {
        answer = "We offer various programs including Engineering (CSE, ME, EE), Business (BBA, MBA), Arts (BA), and Computer Applications (BCA, MCA). For detailed course information, contact the academic office.";
      }
    } else if (questionLower.includes('contact') || questionLower.includes('phone') || questionLower.includes('email')) {
      answer = "Main office: +1-555-123-4567, info@college.edu. Admissions: +1-555-123-4568, admissions@college.edu. Student services: +1-555-123-4569. Website: www.college.edu";
    } else if (questionLower.includes('facility') || questionLower.includes('library') || questionLower.includes('lab')) {
      answer = "Facilities include: Central library (50,000+ books), computer labs, sports complex, cafeteria, medical center, free Wi-Fi, college bus service, and more. Library hours: 8 AM-10 PM.";
    } else if (questionLower.includes('scholarship') || questionLower.includes('financial')) {
      answer = "Scholarships available: Merit-based (up to 50% fee waiver), sports scholarships, need-based financial aid, and international student scholarships. Contact student services for details.";
    } else {
      // Use the most relevant document content
      if (searchResults.documents.length > 0) {
        const bestMatch = searchResults.documents[0];
        answer = `Based on our knowledge base: ${bestMatch.substring(0, 300)}... For more detailed information, please contact the relevant department.`;
      }
    }

    const avgDistance = searchResults.distances.reduce((a, b) => a + b, 0) / searchResults.distances.length;
    const confidence = Math.max(0, 1 - avgDistance) * 0.7; // Lower confidence for rule-based

    return {
      answer,
      sources: sources,
      confidence: Math.round(confidence * 100) / 100
    };
  }

  // Initialize the entire RAG system
  async initialize() {
    console.log('🚀 Initializing RAG system...');
    
    const initialized = await this.initializeCollection();
    if (!initialized) return false;

    // If no vector store exists, create a simple one from text files
    if (this.vectorStore.documents.length === 0) {
      const documents = await this.loadDocuments();
      if (documents.length === 0) return false;

      // Store documents in simple format
      this.vectorStore.documents = documents.map(doc => doc.content);
      this.vectorStore.metadatas = documents.map(doc => doc.metadata);
      this.vectorStore.embeddings = []; // No embeddings for now
    }

    this.isInitialized = true;
    return true;
  }

  // Get collection statistics
  async getStats() {
    try {
      if (!this.vectorStore) {
        await this.initializeCollection();
      }

      return {
        totalDocuments: this.vectorStore.documents.length,
        collectionName: 'college_knowledge',
        status: this.isInitialized ? 'active' : 'not_initialized'
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return { totalDocuments: 0, status: 'error' };
    }
  }
}

module.exports = VectorRAG;
