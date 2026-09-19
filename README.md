# Scorecard

A scorecard web application for tracking performance metrics, with a deployable GitHub Pages demo and an optional Express backend for full-stack use.

> **Note**: This is a basic implementation with a REST API backend. If you're looking for a more feature-rich solution with data visualization, role-based access control, and advanced analytics, check out [scorecard-dashboard](https://github.com/AntManThePro/scorecard-dashboard).

## Features

- **React Frontend**: Clean and minimal UI for entering and viewing scores
- **Node/Express Backend**: RESTful API for managing scores
- **GitHub Pages Demo**: Static deployment that stores demo data in the browser with `localStorage`
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

## GitHub Pages Demo

The GitHub Pages site builds the React app from `frontend/` and serves it as a static demo.

- The Pages demo **does not run the Express backend**
- Demo scores are seeded automatically and stored in the browser using `localStorage`
- Add, edit, and delete actions only affect the browser you are using

If you want the frontend to talk to a deployed backend instead of demo storage, set `VITE_API_URL` to your backend's `/api` base URL before building the frontend. If you need runtime configuration instead, you can define `window.__SCORECARD_API_URL__` before the app loads.

```bash
cd frontend
VITE_API_URL=https://your-backend.example.com/api npm run build
```

Do not hard-code the backend URL in source code.

The repository Pages workflow also sets `VITE_PUBLIC_BASE_PATH=/Scorecard/` at build time so the generated assets work from the project site URL.

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

### Running the Full Application Locally

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

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy).

During local Vite development, the frontend automatically uses `http://localhost:3001/api` unless `VITE_API_URL` or `window.__SCORECARD_API_URL__` is explicitly set.

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

### GET /api/scores/:id
Returns a single score by ID.

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

All numeric fields must be between 0 and 100.

### PUT /api/scores/:id
Update an existing score. All fields are optional — only provided fields are updated.

**Request Body** (all fields optional):
```json
{
  "name": "John Doe",
  "attendance": 97,
  "jobPerformance": 90,
  "extraFactor": 85,
  "notes": "Updated notes"
}
```

### DELETE /api/scores/:id
Remove a score entry. Returns HTTP 204 on success.

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

- The GitHub Pages demo stores scores in the browser, so each device/browser keeps its own local demo data
- The Express backend stores scores in memory, so API-backed data will be lost when the server restarts
- For production use, consider adding a database (MongoDB, PostgreSQL, etc.)
- The "Extra Factor" field is a placeholder that can be customized for specific use cases

## Related Projects

**Looking for more features?** Check out [scorecard-dashboard](https://github.com/AntManThePro/scorecard-dashboard) - a feature-rich alternative with:
- Data visualization with charts
- Role-based access control
- Weekly tracking and historical snapshots
- CSV export capabilities
- Mobile-first design
- No backend required (client-side only)

## Comparison: When to Use Which

### Use This Repository (Scorecard) When:
- You need a simple REST API for scorecard data
- You want to integrate with other backend systems
- You prefer a React-based frontend
- You plan to add database persistence later
- You need programmatic API access to score data

### Use [scorecard-dashboard](https://github.com/AntManThePro/scorecard-dashboard) When:
- You need data visualization and charts
- You want role-based access control
- You need to track daily/weekly performance over time
- You want to export data to CSV
- You prefer a client-side only solution (no backend setup)
- You want to deploy as a static site (e.g., GitHub Pages)

## License

MIT
