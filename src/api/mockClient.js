// Lightweight mock API client. Simulates network latency and gives every
// module API a consistent async shape so swapping in a real HTTP client
// (axios) later only means changing this file, not every call site.

const LATENCY_MS = 220

function delay(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let idCounter = 100000

export function nextId(prefix = 'ID') {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export async function mockGet(data) {
  await delay()
  return clone(data)
}

export async function mockMutate(fn) {
  await delay(180)
  return clone(fn())
}

function clone(value) {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value))
}

export function paginate(items, { page = 1, pageSize = 10 } = {}) {
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)
  return {
    items: pageItems,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  }
}

export function searchItems(items, query, fields) {
  if (!query) return items
  const q = query.toLowerCase()
  return items.filter((item) =>
    fields.some((f) => String(item[f] ?? '').toLowerCase().includes(q))
  )
}

export function sortItems(items, sortBy, sortDir = 'asc') {
  if (!sortBy) return items
  const sorted = [...items].sort((a, b) => {
    const av = a[sortBy]
    const bv = b[sortBy]
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') return av - bv
    return String(av).localeCompare(String(bv))
  })
  return sortDir === 'desc' ? sorted.reverse() : sorted
}
