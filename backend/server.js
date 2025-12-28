const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for scores
let scores = [];
let nextId = 1;

// GET endpoint - retrieve all scores
app.get('/api/scores', (req, res) => {
  res.json(scores);
});

// POST endpoint - add a new score
app.post('/api/scores', (req, res) => {
  const { name, attendance, jobPerformance, extraFactor, notes } = req.body;
  
  // Basic validation
  if (!name || attendance === undefined || jobPerformance === undefined) {
    return res.status(400).json({ error: 'Name, attendance, and job performance are required' });
  }
  
  const newScore = {
    id: nextId++,
    name,
    attendance: parseFloat(attendance),
    jobPerformance: parseFloat(jobPerformance),
    extraFactor: extraFactor !== undefined ? parseFloat(extraFactor) : 0,
    notes: notes || '',
    timestamp: new Date().toISOString()
  };
  
  scores.push(newScore);
  res.status(201).json(newScore);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Scorecard API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
