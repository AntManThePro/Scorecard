import test from 'node:test'
import assert from 'node:assert/strict'

function createLocalStorage(initialState = {}) {
  const store = new Map(Object.entries(initialState))

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
    removeItem(key) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
  }
}

async function loadService({ apiUrl = '', fetchImpl, hostname = 'scorecard.example' } = {}) {
  globalThis.window = {
    __SCORECARD_API_URL__: apiUrl,
    location: { hostname },
    localStorage: createLocalStorage(),
  }
  globalThis.fetch = fetchImpl

  const moduleUrl = new URL(
    `./scoreService.js?hostname=${hostname}&api=${encodeURIComponent(apiUrl)}&ts=${Date.now()}`,
    import.meta.url,
  )
  return import(moduleUrl)
}

test('getScores seeds demo data outside localhost', async () => {
  const service = await loadService()

  const scores = await service.getScores()

  assert.equal(service.isDemoMode(), true)
  assert.equal(scores.length, 2)
  assert.match(service.getStorageMessage(), /saved in this browser only/i)
})

test('getScores uses the default localhost API when no override is set', async () => {
  const apiScores = [{ id: 9, name: 'API User', attendance: 80, jobPerformance: 85, extraFactor: 90, notes: '', timestamp: '2026-03-01T00:00:00.000Z' }]
  const service = await loadService({
    hostname: 'localhost',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => apiScores,
    }),
  })

  const scores = await service.getScores()

  assert.equal(service.isDemoMode(), false)
  assert.equal(service.getApiUrl(), 'http://localhost:3001/api')
  assert.deepEqual(scores, apiScores)
})

test('runtime API configuration overrides demo mode outside localhost', async () => {
  const apiScores = [{ id: 10, name: 'Runtime User', attendance: 91, jobPerformance: 93, extraFactor: 95, notes: '', timestamp: '2026-03-02T00:00:00.000Z' }]
  const service = await loadService({
    apiUrl: 'https://api.example.com/api',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => apiScores,
    }),
  })

  const scores = await service.getScores()

  assert.equal(service.isDemoMode(), false)
  assert.equal(service.getApiUrl(), 'https://api.example.com/api')
  assert.deepEqual(scores, apiScores)
})

test('createScore persists a validated demo score', async () => {
  const service = await loadService()

  const createdScore = await service.createScore({
    name: 'Taylor Smith',
    attendance: '88',
    jobPerformance: '93',
    extraFactor: '90',
    notes: 'Created in demo mode',
  })

  const storedScores = await service.getScores()

  assert.equal(createdScore.id, 3)
  assert.equal(createdScore.attendance, 88)
  assert.equal(storedScores.length, 3)
  assert.equal(storedScores.at(-1)?.name, 'Taylor Smith')
})

test('createScore rejects invalid demo data', async () => {
  const service = await loadService()

  await assert.rejects(
    service.createScore({
      name: '',
      attendance: '101',
      jobPerformance: '80',
      extraFactor: '',
      notes: '',
    }),
    /Name is required/,
  )
})

test('updateScore updates a demo score and records updatedAt', async () => {
  const service = await loadService()

  const updatedScore = await service.updateScore(1, {
    name: 'Alex Johnson',
    attendance: '99',
    jobPerformance: '95',
    extraFactor: '90',
    notes: 'Updated in demo mode',
  })

  assert.equal(updatedScore.attendance, 99)
  assert.equal(updatedScore.notes, 'Updated in demo mode')
  assert.ok(updatedScore.updatedAt)
})

test('updateScore reports missing demo records', async () => {
  const service = await loadService()

  await assert.rejects(
    service.updateScore(999, {
      name: 'Missing User',
      attendance: '90',
      jobPerformance: '90',
      extraFactor: '90',
      notes: '',
    }),
    /Score not found/,
  )
})

test('deleteScore removes a demo record', async () => {
  const service = await loadService()

  await service.deleteScore(1)
  const remainingScores = await service.getScores()

  assert.equal(remainingScores.length, 1)
  assert.equal(remainingScores[0].id, 2)
})

test('deleteScore reports missing demo records', async () => {
  const service = await loadService()

  await assert.rejects(service.deleteScore(999), /Score not found/)
})
