# Scorecard

A simple scorecard web application for tracking performance metrics.

## Features

- **React Frontend**: Clean and minimal UI for entering and viewing scores
- **Node/Express Backend**: RESTful API for managing scores
- **Three Scoring Factors**:
  - Attendance (0-100)
  - Job Performance (0-100)
  - Extra Factor (0-100) - placeholder for custom metrics
- **Real-time Updates**: Scores are displayed immediately after submission
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
Scorecard/
├── backend/           # Node/Express API server
│   ├── server.js      # Main server file with API endpoints
│   └── package.json   # Backend dependencies
├── frontend/          # React application
│   ├── src/
│   │   ├── App.jsx    # Main application component
│   │   ├── App.css    # Application styles
│   │   └── main.jsx   # React entry point
│   └── package.json   # Frontend dependencies
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AntManThePro/Scorecard.git
cd Scorecard
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

You'll need to run both the backend and frontend servers.

#### Start the Backend Server

```bash
cd backend
npm start
```

The backend API will run on `http://localhost:3001`

#### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

### Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Fill in the form with:
   - **Name**: Person or entity being scored
   - **Attendance**: Score from 0-100
   - **Job Performance**: Score from 0-100
   - **Extra Factor**: Optional score from 0-100
   - **Notes**: Optional text notes
3. Click "Add Score" to submit
4. View all submitted scores in the right panel with calculated averages

## API Endpoints

### GET /api/scores
Returns all scores stored in memory.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "attendance": 95,
    "jobPerformance": 88,
    "extraFactor": 92,
    "notes": "Great performance this month",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

### POST /api/scores
Add a new score entry.

**Request Body:**
```json
{
  "name": "John Doe",
  "attendance": 95,
  "jobPerformance": 88,
  "extraFactor": 92,
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "attendance": 95,
  "jobPerformance": 88,
  "extraFactor": 92,
  "notes": "Optional notes",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Scorecard API is running"
}
```

## Technologies Used

- **Frontend**:
  - React 18
  - Vite (build tool)
  - CSS3

- **Backend**:
  - Node.js
  - Express
  - CORS

## Notes

- Scores are stored in memory, so they will be lost when the server restarts
- For production use, consider adding a database (MongoDB, PostgreSQL, etc.)
- The "Extra Factor" field is a placeholder that can be customized for specific use cases

## License

MIT
