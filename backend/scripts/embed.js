// scripts/embed.js
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const OpenAI = require("openai");

// Initialize OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory vector store for now
const vectorStore = {
  documents: [],
  embeddings: [],
  metadatas: []
};

// Helper: split text into chunks
function chunkText(text, chunkSize = 800, overlap = 100) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

async function run() {
  try {
    console.log("🚀 Starting embedding process...");

    const dataDir = path.join(__dirname, "..", "data");
    const files = fs.readdirSync(dataDir);

    for (const file of files) {
      const content = fs.readFileSync(path.join(dataDir, file), "utf-8");
      const chunks = chunkText(content);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Create embedding via OpenAI
        const embedding = await client.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
        });

        // Store in simple vector store
        vectorStore.documents.push(chunk);
        vectorStore.embeddings.push(embedding.data[0].embedding);
        vectorStore.metadatas.push({ source: file, chunkIndex: i });

        console.log(`✅ Embedded chunk ${i} from ${file}`);
      }
    }

    // Save vector store to file
    const storePath = path.join(__dirname, "..", "data", "vector_store.json");
    fs.writeFileSync(storePath, JSON.stringify(vectorStore, null, 2));

    console.log(`🎉 Successfully embedded ${vectorStore.documents.length} chunks!`);
    console.log(`📁 Vector store saved to: ${storePath}`);
  } catch (err) {
    console.error("❌ Embedding script error:", err);
  }
}

run();
