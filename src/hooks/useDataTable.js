import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'

// Drives every list/table screen: search, filters, sort, pagination against
// an async `fetcher({ query, page, pageSize, sortBy, sortDir, filters })`
// that resolves to { items, total, page, pageSize, totalPages }.
export function useDataTable(fetcher, { pageSize = 10, initialFilters = {}, initialSort = null } = {}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState(initialSort)
  const [state, setState] = useState({ items: [], total: 0, totalPages: 1, loading: true, error: null })
  const [refreshTick, setRefreshTick] = useState(0)
  const debouncedQuery = useDebounce(query, 250)

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const result = await fetcher({
        query: debouncedQuery,
        page,
        pageSize,
        sortBy: sort?.by,
        sortDir: sort?.dir,
        filters,
      })
      setState({ items: result.items, total: result.total, totalPages: result.totalPages, loading: false, error: null })
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message || 'Something went wrong' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page, pageSize, sort, JSON.stringify(filters), refreshTick])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, JSON.stringify(filters)])

  const toggleSort = (field) => {
    setSort((prev) => {
      if (!prev || prev.by !== field) return { by: field, dir: 'asc' }
      if (prev.dir === 'asc') return { by: field, dir: 'desc' }
      return null
    })
  }

  const refresh = () => setRefreshTick((t) => t + 1)

  return {
    query,
    setQuery,
    page,
    setPage,
    filters,
    setFilters,
    sort,
    toggleSort,
    refresh,
    pageSize,
    ...state,
  }
}
