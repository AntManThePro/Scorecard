import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001/api';

const EMPTY_FORM = {
  name: '',
  attendance: '',
  jobPerformance: '',
  extraFactor: '',
  notes: ''
};

function App() {
  const [scores, setScores] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(EMPTY_FORM);

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

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newScore = await response.json();
        setScores(prev => [...prev, newScore]);
        setFormData(EMPTY_FORM);
        showMessage('Score added successfully!');
      } else {
        const error = await response.json();
        showMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      showMessage('Error submitting score');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this score entry?')) return;
    try {
      const response = await fetch(`${API_URL}/scores/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setScores(prev => prev.filter(s => s.id !== id));
        showMessage('Score deleted.');
      } else {
        showMessage('Error deleting score');
      }
    } catch (error) {
      console.error('Error deleting score:', error);
      showMessage('Error deleting score');
    }
  };

  const startEdit = (score) => {
    setEditingId(score.id);
    setEditData({
      name: score.name,
      attendance: score.attendance,
      jobPerformance: score.jobPerformance,
      extraFactor: score.extraFactor,
      notes: score.notes
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(EMPTY_FORM);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (id) => {
    try {
      const response = await fetch(`${API_URL}/scores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        const updated = await response.json();
        setScores(prev => prev.map(s => s.id === id ? updated : s));
        cancelEdit();
        showMessage('Score updated.');
      } else {
        const error = await response.json();
        showMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating score:', error);
      showMessage('Error updating score');
    }
  };

  const calculateAverage = (score) => {
    const extra = score.extraFactor || 0;
    return ((score.attendance + score.jobPerformance + extra) / 3).toFixed(2);
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
              <label htmlFor="attendance">Attendance (0–100) *</label>
              <input
                type="number"
                id="attendance"
                name="attendance"
                value={formData.attendance}
                onChange={handleChange}
                min="0"
                max="100"
                required
                placeholder="0–100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobPerformance">Job Performance (0–100) *</label>
              <input
                type="number"
                id="jobPerformance"
                name="jobPerformance"
                value={formData.jobPerformance}
                onChange={handleChange}
                min="0"
                max="100"
                required
                placeholder="0–100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="extraFactor">Extra Factor (0–100)</label>
              <input
                type="number"
                id="extraFactor"
                name="extraFactor"
                value={formData.extraFactor}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="0–100"
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
              {loading ? 'Adding…' : 'Add Score'}
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
                  {editingId === score.id ? (
                    <div className="edit-form">
                      <div className="form-group">
                        <label>Name *</label>
                        <input type="text" name="name" value={editData.name} onChange={handleEditChange} required />
                      </div>
                      <div className="form-group">
                        <label>Attendance (0–100) *</label>
                        <input type="number" name="attendance" value={editData.attendance} onChange={handleEditChange} min="0" max="100" required />
                      </div>
                      <div className="form-group">
                        <label>Job Performance (0–100) *</label>
                        <input type="number" name="jobPerformance" value={editData.jobPerformance} onChange={handleEditChange} min="0" max="100" required />
                      </div>
                      <div className="form-group">
                        <label>Extra Factor (0–100)</label>
                        <input type="number" name="extraFactor" value={editData.extraFactor} onChange={handleEditChange} min="0" max="100" />
                      </div>
                      <div className="form-group">
                        <label>Notes</label>
                        <textarea name="notes" value={editData.notes} onChange={handleEditChange} rows="2" />
                      </div>
                      <div className="edit-actions">
                        <button className="save-btn" onClick={() => handleEditSubmit(score.id)}>Save</button>
                        <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                      <div className="score-footer">
                        <span className="score-timestamp">
                          {new Date(score.timestamp).toLocaleString()}
                        </span>
                        <div className="card-actions">
                          <button className="edit-btn" onClick={() => startEdit(score)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(score.id)}>Delete</button>
                        </div>
                      </div>
                    </>
                  )}
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
