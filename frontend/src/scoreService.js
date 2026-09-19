const DEFAULT_LOCAL_API_URL = 'http://localhost:3001/api'
const DEMO_STORAGE_KEY = 'scorecard.demo.scores'

const DEMO_SCORES = [
  {
    id: 1,
    name: 'Alex Johnson',
    attendance: 96,
    jobPerformance: 91,
    extraFactor: 88,
    notes: 'Strong consistency and teamwork.',
    timestamp: '2026-01-15T14:30:00.000Z',
  },
  {
    id: 2,
    name: 'Jordan Lee',
    attendance: 89,
    jobPerformance: 94,
    extraFactor: 92,
    notes: 'Excellent initiative on recent projects.',
    timestamp: '2026-02-02T09:15:00.000Z',
  },
]

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const isLocalHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname)

export const API_URL = configuredApiUrl || (isLocalHost ? DEFAULT_LOCAL_API_URL : '')
export const isDemoMode = !API_URL

function validateScoreField(value, fieldName) {
  const parsed = Number.parseFloat(value)

  if (Number.isNaN(parsed)) {
    return `${fieldName} must be a number`
  }

  if (parsed < 0 || parsed > 100) {
    return `${fieldName} must be between 0 and 100`
  }

  return null
}

function normalizeScorePayload(payload) {
  const name = String(payload.name ?? '').trim()
  const attendance = payload.attendance
  const jobPerformance = payload.jobPerformance
  const extraFactor = payload.extraFactor

  if (!name) {
    throw new Error('Name is required')
  }

  if (attendance === undefined || attendance === '') {
    throw new Error('Attendance is required')
  }

  if (jobPerformance === undefined || jobPerformance === '') {
    throw new Error('Job Performance is required')
  }

  const attendanceError = validateScoreField(attendance, 'Attendance')
  if (attendanceError) {
    throw new Error(attendanceError)
  }

  const jobPerformanceError = validateScoreField(jobPerformance, 'Job Performance')
  if (jobPerformanceError) {
    throw new Error(jobPerformanceError)
  }

  if (extraFactor !== undefined && extraFactor !== '') {
    const extraFactorError = validateScoreField(extraFactor, 'Extra Factor')
    if (extraFactorError) {
      throw new Error(extraFactorError)
    }
  }

  return {
    name,
    attendance: Number.parseFloat(attendance),
    jobPerformance: Number.parseFloat(jobPerformance),
    extraFactor:
      extraFactor !== undefined && extraFactor !== ''
        ? Number.parseFloat(extraFactor)
        : 0,
    notes: String(payload.notes ?? '').trim(),
  }
}

function ensureDemoScores() {
  const existingScores = window.localStorage.getItem(DEMO_STORAGE_KEY)

  if (existingScores) {
    return
  }

  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_SCORES))
}

function readDemoScores() {
  ensureDemoScores()

  try {
    return JSON.parse(window.localStorage.getItem(DEMO_STORAGE_KEY) ?? '[]')
  } catch {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_SCORES))
    return [...DEMO_SCORES]
  }
}

function writeDemoScores(scores) {
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(scores))
}

async function readApiResponse(response) {
  if (response.ok) {
    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  let message = 'Request failed'

  try {
    const error = await response.json()
    if (error?.error) {
      message = error.error
    }
  } catch {
    // Ignore invalid error payloads and use the default message.
  }

  throw new Error(message)
}

export function getStorageMessage() {
  if (isDemoMode) {
    return 'Demo mode is active. Scores are seeded with sample data and saved in this browser only.'
  }

  return `API mode is active. The app is using ${API_URL}.`
}

export async function getScores() {
  if (isDemoMode) {
    return readDemoScores()
  }

  const response = await fetch(`${API_URL}/scores`)
  return readApiResponse(response)
}

export async function createScore(payload) {
  if (isDemoMode) {
    const normalized = normalizeScorePayload(payload)
    const scores = readDemoScores()
    const nextId = scores.reduce((maxId, score) => Math.max(maxId, score.id), 0) + 1
    const newScore = {
      ...normalized,
      id: nextId,
      timestamp: new Date().toISOString(),
    }

    writeDemoScores([...scores, newScore])
    return newScore
  }

  const response = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return readApiResponse(response)
}

export async function updateScore(id, payload) {
  if (isDemoMode) {
    const normalized = normalizeScorePayload(payload)
    const scores = readDemoScores()
    const scoreIndex = scores.findIndex((score) => score.id === id)

    if (scoreIndex === -1) {
      throw new Error('Score not found')
    }

    const updatedScore = {
      ...scores[scoreIndex],
      ...normalized,
      updatedAt: new Date().toISOString(),
    }

    scores[scoreIndex] = updatedScore
    writeDemoScores(scores)
    return updatedScore
  }

  const response = await fetch(`${API_URL}/scores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return readApiResponse(response)
}

export async function deleteScore(id) {
  if (isDemoMode) {
    const scores = readDemoScores()
    const nextScores = scores.filter((score) => score.id !== id)

    if (nextScores.length === scores.length) {
      throw new Error('Score not found')
    }

    writeDemoScores(nextScores)
    return
  }

  const response = await fetch(`${API_URL}/scores/${id}`, { method: 'DELETE' })
  await readApiResponse(response)
}
