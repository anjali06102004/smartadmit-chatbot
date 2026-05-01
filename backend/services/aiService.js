const EdenAI = require('edenai');
const OpenAI = require('openai');
require('dotenv').config();

class AIService {
  constructor() {
    // Initialize multiple AI providers
    this.providers = {
      openai: new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      }),
      edenai: new EdenAI.Text({
        apiKey: process.env.EDENAI_API_KEY || 'your_edenai_key_here',
      }),
    };

    // Model configurations with priorities and fallbacks
    this.models = {
      primary: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        priority: 1,
        cost: 'low',
        quality: 'high',
        maxTokens: 500,
        temperature: 0.7
      },
      secondary: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        priority: 2,
        cost: 'very_low',
        quality: 'medium',
        maxTokens: 500,
        temperature: 0.7
      },
      fallback: {
        provider: 'edenai',
        model: 'openai/gpt-3.5-turbo',
        priority: 3,
        cost: 'low',
        quality: 'medium',
        maxTokens: 500,
        temperature: 0.7
      },
      emergency: {
        provider: 'rule_based',
        model: 'local',
        priority: 4,
        cost: 'free',
        quality: 'basic',
        maxTokens: 0,
        temperature: 0
      }
    };

    // Performance tracking
    this.performance = {
      openai: { success: 0, failures: 0, avgResponseTime: 0 },
      edenai: { success: 0, failures: 0, avgResponseTime: 0 },
      rule_based: { success: 0, failures: 0, avgResponseTime: 0 }
    };

    // Circuit breaker for failed providers
    this.circuitBreaker = {
      openai: { failures: 0, lastFailure: null, isOpen: false },
      edenai: { failures: 0, lastFailure: null, isOpen: false }
    };
  }

  // Get available models based on current status
  getAvailableModels() {
    const available = [];
    
    for (const [name, config] of Object.entries(this.models)) {
      if (config.provider === 'rule_based') {
        available.push({ name, ...config });
        continue;
      }

      const breaker = this.circuitBreaker[config.provider];
      const isHealthy = !breaker.isOpen || 
        (Date.now() - breaker.lastFailure) > 300000; // 5 minutes cooldown

      if (isHealthy) {
        available.push({ name, ...config });
      }
    }

    return available.sort((a, b) => a.priority - b.priority);
  }

  // Circuit breaker logic
  updateCircuitBreaker(provider, success) {
    const breaker = this.circuitBreaker[provider];
    
    if (success) {
      breaker.failures = 0;
      breaker.isOpen = false;
    } else {
      breaker.failures++;
      breaker.lastFailure = Date.now();
      
      // Open circuit after 3 consecutive failures
      if (breaker.failures >= 3) {
        breaker.isOpen = true;
        console.log(`🔴 Circuit breaker opened for ${provider}`);
      }
    }
  }

  // Generate response using the best available model
  async generateResponse(prompt, context = '', conversationHistory = []) {
    const availableModels = this.getAvailableModels();
    
    if (availableModels.length === 0) {
      throw new Error('No AI models available');
    }

    // Try models in priority order
    for (const model of availableModels) {
      try {
        console.log(`🤖 Trying ${model.provider}/${model.model}...`);
        
        const startTime = Date.now();
        const response = await this.callModel(model, prompt, context, conversationHistory);
        const responseTime = Date.now() - startTime;

        // Update performance metrics
        this.updatePerformance(model.provider, true, responseTime);
        this.updateCircuitBreaker(model.provider, true);

        console.log(`✅ Success with ${model.provider}/${model.model} (${responseTime}ms)`);
        
        return {
          ...response,
          model: model.model,
          provider: model.provider,
          responseTime,
          confidence: this.calculateConfidence(model, responseTime)
        };

      } catch (error) {
        console.log(`❌ Failed with ${model.provider}/${model.model}: ${error.message}`);
        
        this.updatePerformance(model.provider, false, 0);
        this.updateCircuitBreaker(model.provider, false);
        
        // Continue to next model
        continue;
      }
    }

    throw new Error('All AI models failed');
  }

  // Call specific model
  async callModel(model, prompt, context, conversationHistory) {
    switch (model.provider) {
      case 'openai':
        return await this.callOpenAI(model, prompt, context, conversationHistory);
      case 'edenai':
        return await this.callEdenAI(model, prompt, context, conversationHistory);
      case 'rule_based':
        return await this.callRuleBased(prompt, context);
      default:
        throw new Error(`Unknown provider: ${model.provider}`);
    }
  }

  // OpenAI API call
  async callOpenAI(model, prompt, context, conversationHistory) {
    const messages = [
      {
        role: 'system',
        content: `You are a helpful college assistant. Use the provided context to answer student questions accurately and helpfully.

Context: ${context}

${conversationHistory.length > 0 ? `Recent conversation:\n${conversationHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}\n` : ''}

Instructions:
- Answer based on the provided context
- Be helpful, friendly, and professional
- If information is not available, suggest contacting the relevant department`
      },
      { role: 'user', content: prompt }
    ];

    const response = await this.providers.openai.chat.completions.create({
      model: model.model,
      messages,
      max_tokens: model.maxTokens,
      temperature: model.temperature
    });

    return {
      answer: response.choices[0].message.content,
      sources: ['OpenAI'],
      model: model.model
    };
  }

  // Eden AI API call
  async callEdenAI(model, prompt, context, conversationHistory) {
    const response = await this.providers.edenai.chat({
      text: prompt,
      providers: 'openai',
      settings: {
        openai: {
          model: model.model.split('/')[1], // Remove provider prefix
          max_tokens: model.maxTokens,
          temperature: model.temperature
        }
      },
      previous_history: conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        message: msg.text
      })),
      system_prompt: `You are a helpful college assistant. Context: ${context}`
    });

    return {
      answer: response.openai.generated_text,
      sources: ['EdenAI'],
      model: model.model
    };
  }

  // Rule-based fallback
  async callRuleBased(prompt, context) {
    const questionLower = prompt.toLowerCase();
    
    // Enhanced rule-based responses
    if (questionLower.includes('admission') || questionLower.includes('apply')) {
      return {
        answer: "Based on our records, the admission process typically includes: 1) Online application, 2) Document verification, 3) Entrance exam/Interview, 4) Merit list, 5) Fee payment. For current details, contact admissions at +1-555-123-4568 or admissions@college.edu.",
        sources: ['Knowledge Base'],
        model: 'rule_based'
      };
    } else if (questionLower.includes('fee') || questionLower.includes('cost')) {
      return {
        answer: "Course fees range from $5500-$12000 per semester. Additional fees may include lab fee, library fee, sports fee, and development fee. Hostel fee is typically $1200 per semester. For current fee structure, contact the accounts office.",
        sources: ['Knowledge Base'],
        model: 'rule_based'
      };
    } else if (questionLower.includes('hostel')) {
      return {
        answer: "Hostel information: Fee is typically $1200 per semester, curfew at 9:00 PM, contact hostel warden at +1-555-123-4570 for more details. Rules include maintaining cleanliness and following cafeteria timings.",
        sources: ['Knowledge Base'],
        model: 'rule_based'
      };
    } else if (questionLower.includes('course') || questionLower.includes('program')) {
      return {
        answer: "We offer various programs including Engineering (CSE, ME, EE), Business (BBA, MBA), Arts (BA), and Computer Applications (BCA, MCA). For detailed course information, contact the academic office.",
        sources: ['Knowledge Base'],
        model: 'rule_based'
      };
    } else if (questionLower.includes('contact') || questionLower.includes('phone') || questionLower.includes('email')) {
      return {
        answer: "Main office: +1-555-123-4567, info@college.edu. Admissions: +1-555-123-4568, admissions@college.edu. Student services: +1-555-123-4569. Website: www.college.edu",
        sources: ['Knowledge Base'],
        model: 'rule_based'
      };
    } else if (questionLower.includes('facility') || questionLower.includes('library') || questionLower.includes('lab')) {
      return {
        answer: "Facilities include: Central library (50,000+ books), computer labs, sports complex, cafeteria, medical center, free Wi-Fi, college bus service, and more. Library hours: 8 AM-10 PM.",
        sources: ['Knowledge Base'],
        model: 'rule_based'
      };
    } else if (questionLower.includes('scholarship') || questionLower.includes('financial')) {
      return {
        answer: "Scholarships available: Merit-based (up to 50% fee waiver), sports scholarships, need-based financial aid, and international student scholarships. Contact student services for details.",
        sources: ['Knowledge Base'],
        model: 'rule_based'
      };
    } else {
      return {
        answer: "I found some relevant information in our knowledge base, but I'm currently unable to provide a detailed AI-generated response. Please contact the college directly for more specific information.",
        sources: ['Knowledge Base'],
        model: 'rule_based'
      };
    }
  }

  // Update performance metrics
  updatePerformance(provider, success, responseTime) {
    const perf = this.performance[provider];
    
    if (success) {
      perf.success++;
      perf.avgResponseTime = (perf.avgResponseTime * (perf.success - 1) + responseTime) / perf.success;
    } else {
      perf.failures++;
    }
  }

  // Calculate confidence based on model and performance
  calculateConfidence(model, responseTime) {
    let baseConfidence = 0.8; // Base confidence for AI models
    
    if (model.provider === 'rule_based') {
      baseConfidence = 0.6;
    }
    
    // Adjust based on response time (faster = higher confidence)
    const timeBonus = Math.max(0, (2000 - responseTime) / 2000 * 0.2);
    
    // Adjust based on model quality
    const qualityBonus = model.quality === 'high' ? 0.1 : 
                        model.quality === 'medium' ? 0.05 : 0;
    
    return Math.min(1, baseConfidence + timeBonus + qualityBonus);
  }

  // Get performance statistics
  getPerformanceStats() {
    return {
      providers: this.performance,
      circuitBreakers: this.circuitBreaker,
      availableModels: this.getAvailableModels().length,
      totalRequests: Object.values(this.performance).reduce((sum, p) => sum + p.success + p.failures, 0)
    };
  }

  // Reset circuit breakers (for testing)
  resetCircuitBreakers() {
    for (const provider in this.circuitBreaker) {
      this.circuitBreaker[provider] = {
        failures: 0,
        lastFailure: null,
        isOpen: false
      };
    }
    console.log('🔄 Circuit breakers reset');
  }
}

module.exports = AIService;
