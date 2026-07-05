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

// Validate a numeric score field (must be 0–100)
function validateScoreField(value, fieldName) {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return `${fieldName} must be a number`;
  if (parsed < 0 || parsed > 100) return `${fieldName} must be between 0 and 100`;
  return null;
}

// GET /api/scores - retrieve all scores
app.get('/api/scores', (req, res) => {
  res.json(scores);
});

// GET /api/scores/:id - retrieve a single score
app.get('/api/scores/:id', (req, res) => {
  const score = scores.find(s => s.id === parseInt(req.params.id));
  if (!score) return res.status(404).json({ error: 'Score not found' });
  res.json(score);
});

// POST /api/scores - add a new score
app.post('/api/scores', (req, res) => {
  const { name, attendance, jobPerformance, extraFactor, notes } = req.body;

  if (!name || String(name).trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (attendance === undefined || attendance === '') {
    return res.status(400).json({ error: 'Attendance is required' });
  }
  if (jobPerformance === undefined || jobPerformance === '') {
    return res.status(400).json({ error: 'Job Performance is required' });
  }

  const attendanceError = validateScoreField(attendance, 'Attendance');
  if (attendanceError) return res.status(400).json({ error: attendanceError });

  const jobPerfError = validateScoreField(jobPerformance, 'Job Performance');
  if (jobPerfError) return res.status(400).json({ error: jobPerfError });

  const parsedExtraFactor = extraFactor !== undefined && extraFactor !== '' ? parseFloat(extraFactor) : 0;
  const hasExtraFactor = extraFactor !== undefined && extraFactor !== '';
  if (hasExtraFactor) {
    const extraError = validateScoreField(extraFactor, 'Extra Factor');
    if (extraError) return res.status(400).json({ error: extraError });
  }

  const newScore = {
    id: nextId++,
    name: String(name).trim(),
    attendance: parseFloat(attendance),
    jobPerformance: parseFloat(jobPerformance),
    extraFactor: isNaN(parsedExtraFactor) ? 0 : parsedExtraFactor,
    notes: notes ? String(notes).trim() : '',
    timestamp: new Date().toISOString()
  };

  scores.push(newScore);
  res.status(201).json(newScore);
});

// PUT /api/scores/:id - update an existing score
app.put('/api/scores/:id', (req, res) => {
  const index = scores.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Score not found' });

  const { name, attendance, jobPerformance, extraFactor, notes } = req.body;

  if (name !== undefined && String(name).trim() === '') {
    return res.status(400).json({ error: 'Name cannot be empty' });
  }
  if (attendance !== undefined && attendance !== '') {
    const err = validateScoreField(attendance, 'Attendance');
    if (err) return res.status(400).json({ error: err });
  }
  if (jobPerformance !== undefined && jobPerformance !== '') {
    const err = validateScoreField(jobPerformance, 'Job Performance');
    if (err) return res.status(400).json({ error: err });
  }
  if (extraFactor !== undefined && extraFactor !== '') {
    const err = validateScoreField(extraFactor, 'Extra Factor');
    if (err) return res.status(400).json({ error: err });
  }

  const existing = scores[index];
  scores[index] = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    attendance: attendance !== undefined && attendance !== '' ? parseFloat(attendance) : existing.attendance,
    jobPerformance: jobPerformance !== undefined && jobPerformance !== '' ? parseFloat(jobPerformance) : existing.jobPerformance,
    extraFactor: extraFactor !== undefined && extraFactor !== '' ? parseFloat(extraFactor) : existing.extraFactor,
    notes: notes !== undefined ? String(notes).trim() : existing.notes,
    updatedAt: new Date().toISOString()
  };

  res.json(scores[index]);
});

// DELETE /api/scores/:id - remove a score
app.delete('/api/scores/:id', (req, res) => {
  const index = scores.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Score not found' });
  scores.splice(index, 1);
  res.status(204).send();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Scorecard API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
