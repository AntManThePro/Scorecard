import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001/api';

function App() {
  const [scores, setScores] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    attendance: '',
    jobPerformance: '',
    extraFactor: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await fetch(`${API_URL}/scores`);
      const data = await response.json();
      setScores(data);
    } catch (error) {
      console.error('Error fetching scores:', error);
      setMessage('Error loading scores');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newScore = await response.json();
        setScores([...scores, newScore]);
        setFormData({
          name: '',
          attendance: '',
          jobPerformance: '',
          extraFactor: '',
          notes: ''
        });
        setMessage('Score added successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      setMessage('Error submitting score');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateAverage = (score) => {
    const extraFactorValue = score.extraFactor || 0;
    const total = score.attendance + score.jobPerformance + extraFactorValue;
    return (total / 3).toFixed(2);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Scorecard</h1>
        <p>Track performance metrics</p>
      </header>

      <main className="main-content">
        <section className="form-section">
          <h2>Add New Score</h2>
          <form onSubmit={handleSubmit} className="score-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="attendance">Attendance (0-100) *</label>
              <input
                type="number"
                id="attendance"
                name="attendance"
                value={formData.attendance}
                onChange={handleChange}
                min="0"
                max="100"
                required
                placeholder="0-100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobPerformance">Job Performance (0-100) *</label>
              <input
                type="number"
                id="jobPerformance"
                name="jobPerformance"
                value={formData.jobPerformance}
                onChange={handleChange}
                min="0"
                max="100"
                required
                placeholder="0-100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="extraFactor">Extra Factor (0-100)</label>
              <input
                type="number"
                id="extraFactor"
                name="extraFactor"
                value={formData.extraFactor}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="0-100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes"
                rows="3"
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Adding...' : 'Add Score'}
            </button>

            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </form>
        </section>

        <section className="scores-section">
          <h2>Score History ({scores.length})</h2>
          {scores.length === 0 ? (
            <p className="empty-message">No scores yet. Add your first score above!</p>
          ) : (
            <div className="scores-list">
              {scores.map((score) => (
                <div key={score.id} className="score-card">
                  <div className="score-header">
                    <h3>{score.name}</h3>
                    <span className="average">Avg: {calculateAverage(score)}</span>
                  </div>
                  <div className="score-details">
                    <div className="score-item">
                      <span className="label">Attendance:</span>
                      <span className="value">{score.attendance}</span>
                    </div>
                    <div className="score-item">
                      <span className="label">Job Performance:</span>
                      <span className="value">{score.jobPerformance}</span>
                    </div>
                    <div className="score-item">
                      <span className="label">Extra Factor:</span>
                      <span className="value">{score.extraFactor}</span>
                    </div>
                  </div>
                  {score.notes && (
                    <div className="score-notes">
                      <strong>Notes:</strong> {score.notes}
                    </div>
                  )}
                  <div className="score-timestamp">
                    {new Date(score.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
