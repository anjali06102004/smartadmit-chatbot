const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const chatRoute = require('./routes/chat');
const leadsRoute = require('./routes/leads');

// Use routes
app.use('/api/chat', chatRoute);
app.use('/api/leads', leadsRoute);

// Simple health check route
app.get('/', (req, res) => {
  res.json({ message: 'College Chatbot API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 