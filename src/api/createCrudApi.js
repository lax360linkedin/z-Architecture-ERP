import { mockGet, mockMutate, nextId, paginate, searchItems, sortItems } from './mockClient'

// Generic in-memory CRUD factory used by every module API. Each module keeps
// its own mutable array (seeded from src/data) so create/update/delete calls
// persist for the session without a real backend.
export function createCrudApi({ store, idPrefix = 'ID', searchFields = [] }) {
  return {
    async list({ query = '', page = 1, pageSize = 10, sortBy, sortDir, filters = {} } = {}) {
      let items = await mockGet(store)
      items = searchItems(items, query, searchFields)
      Object.entries(filters).forEach(([key, value]) => {
        if (value == null || value === '' || value === 'all') return
        items = items.filter((item) => item[key] === value)
      })
      items = sortItems(items, sortBy, sortDir)
      return paginate(items, { page, pageSize })
    },
    async all() {
      return mockGet(store)
    },
    async get(id) {
      const found = store.find((item) => item.id === id)
      return mockGet(found ?? null)
    },
    async create(payload) {
      return mockMutate(() => {
        const record = { id: nextId(idPrefix), ...payload }
        store.unshift(record)
        return record
      })
    },
    async update(id, payload) {
      return mockMutate(() => {
        const idx = store.findIndex((item) => item.id === id)
        if (idx === -1) throw new Error('Record not found')
        store[idx] = { ...store[idx], ...payload }
        return store[idx]
      })
    },
    async remove(id) {
      return mockMutate(() => {
        const idx = store.findIndex((item) => item.id === id)
        if (idx > -1) store.splice(idx, 1)
        return { id }
      })
    },
  }
}
