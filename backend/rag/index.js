const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function getAnswerWithRAG(question) {
  try {
    // Load documents using Node.js fs instead of langchain
    const dataDir = path.join(__dirname, '..', 'data');
    console.log("Loading documents from:", dataDir);
    
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.txt'));
    console.log("Found files:", files);
    
    if (files.length === 0) {
      throw new Error("No .txt files found in the data folder.");
    }
    
    // Read all text files
    const documents = [];
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      documents.push({ pageContent: content, source: file });
    }
    
    console.log("Loaded documents:", documents.length);

    // Simple keyword-based search
    const allContent = documents.map(doc => doc.pageContent).join("\n");
    
    // Extract relevant context based on keywords in the question
    const questionWords = question.toLowerCase().split(' ');
    const relevantDocs = documents.filter(doc => 
      questionWords.some(word => 
        doc.pageContent.toLowerCase().includes(word)
      )
    );
    
    const context = relevantDocs.length > 0 
      ? relevantDocs.map(doc => doc.pageContent).join("\n")
      : allContent;

    // Enhanced rule-based response
    let answer = "I don't have specific information about that. Please contact the college directly.";
    
    const questionLower = question.toLowerCase();
    
    // Hostel related questions
    if (questionLower.includes('hostel') && questionLower.includes('fee')) {
      answer = "The hostel fee for the academic year 2024 is $1200 per semester. This includes accommodation and basic amenities.";
    } else if (questionLower.includes('hostel') && questionLower.includes('rule')) {
      answer = "Hostel rules include: Students must return before 9:00 PM, no visitors in rooms, maintain cleanliness, and follow cafeteria timings. For detailed rules, contact the hostel warden at +1-555-123-4570.";
    } else if (questionLower.includes('hostel')) {
      answer = "Hostel information: Fee is $1200 per semester, curfew at 9:00 PM, contact hostel warden at +1-555-123-4570 for more details.";
    }
    
    // Admission related questions
    else if (questionLower.includes('admission') || questionLower.includes('apply')) {
      answer = "Admission process: 1) Online application, 2) Document verification, 3) Entrance exam/Interview, 4) Merit list, 5) Fee payment. Contact admissions at +1-555-123-4568 or admissions@college.edu.";
    } else if (questionLower.includes('document') || questionLower.includes('required')) {
      answer = "Required documents: 10th/12th mark sheets, transfer certificate, character certificate, ID proof, photographs. Application fee is $50.";
    }
    
    // Course and fee related questions
    else if (questionLower.includes('course') || questionLower.includes('program')) {
      answer = "We offer Engineering (CSE: $8000/sem, ME: $7500/sem, EE: $7800/sem), Business (BBA: $6500/sem, MBA: $12000/sem), Arts (BA: $5500/sem), and Computer Applications (BCA: $7000/sem, MCA: $10000/sem).";
    } else if (questionLower.includes('fee') || questionLower.includes('cost')) {
      answer = "Course fees range from $5500-$12000 per semester. Additional fees: Lab fee $500, Library fee $200, Sports fee $300, Development fee $1000. Hostel fee is $1200 per semester.";
    }
    
    // Contact related questions
    else if (questionLower.includes('contact') || questionLower.includes('phone') || questionLower.includes('email')) {
      answer = "Main office: +1-555-123-4567, info@college.edu. Admissions: +1-555-123-4568, admissions@college.edu. Student services: +1-555-123-4569. Website: www.college.edu";
    }
    
    // Facilities related questions
    else if (questionLower.includes('facility') || questionLower.includes('library') || questionLower.includes('lab')) {
      answer = "Facilities include: Central library (50,000+ books), 5 computer labs, sports complex, cafeteria, medical center, free Wi-Fi, college bus service, and more. Library hours: 8 AM-10 PM.";
    }
    
    // Scholarship related questions
    else if (questionLower.includes('scholarship') || questionLower.includes('financial')) {
      answer = "Scholarships available: Merit-based (up to 50% fee waiver), sports scholarships, need-based financial aid, and international student scholarships. Contact student services for details.";
    }

    return answer;
  } catch (error) {
    console.error('RAG Error:', error);
    throw new Error(`Failed to generate answer: ${error.message}`);
  }
}

module.exports = { getAnswerWithRAG };