import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, FileBarChart2, SearchX } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { reportsApi, reportCategories } from '../../api/reportsApi'
import { branches } from '../../data/admin'
import { formatCurrency, classNames } from '../../utils/format'

const MONEY_HINTS = ['value', 'amount', 'budget', 'paid', 'invoiced', 'collected', 'total', 'actual', 'balance', 'variance', 'margin', 'revenue']

const DATE_RANGES = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'qtr', label: 'This Quarter' },
  { value: 'fy', label: 'This Financial Year' },
]

function isMoneyColumn(header) {
  const h = String(header).toLowerCase()
  return MONEY_HINTS.some((hint) => h.includes(hint))
}

export default function Reports() {
  const [activeCategory, setActiveCategory] = useState(reportCategories[0])
  const [activeReport, setActiveReport] = useState(reportCategories[0].reports[0])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [range, setRange] = useState('30d')
  const [branch, setBranch] = useState('all')

  function runReport(report) {
    setLoading(true)
    reportsApi.run(report.id).then((res) => {
      setResult(res)
      setLoading(false)
    })
  }

  useEffect(() => {
    runReport(activeReport)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selectReport(category, report) {
    setActiveCategory(category)
    setActiveReport(report)
    setQuery('')
    runReport(report)
  }

  function handleRangeChange(e) {
    setRange(e.target.value)
    runReport(activeReport)
  }

  function handleExport() {
    toast.success(`${activeReport.label} report exported`)
  }

  const filteredRows = useMemo(() => {
    if (!result) return []
    if (!query) return result.rows
    const q = query.toLowerCase()
    return result.rows.filter((row) => row.some((cell) => String(cell).toLowerCase().includes(q)))
  }, [result, query])

  const moneyCols = useMemo(() => (result ? result.columns.map(isMoneyColumn) : []), [result])

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Run and export reports across every module" />
      <PageBody className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Card padded={false} className="w-full shrink-0 lg:w-64">
          <div className="max-h-[75vh] overflow-y-auto p-3">
            {reportCategories.map((category) => (
              <div key={category.id} className="mb-3 last:mb-0">
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">{category.label}</p>
                <div className="flex flex-col gap-0.5">
                  {category.reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => selectReport(category, report)}
                      className={classNames(
                        'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors',
                        activeReport.id === report.id
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                          : 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
                      )}
                    >
                      <FileBarChart2 className="h-3.5 w-3.5 shrink-0" />
                      {report.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card padded={false}>
            <CardHeader
              className="px-5 pt-5"
              title={activeReport.label}
              subtitle={`${activeCategory.label} · ${filteredRows.length} row${filteredRows.length === 1 ? '' : 's'}`}
              action={
                <Button size="sm" variant="secondary" icon={Download} onClick={handleExport}>
                  Export
                </Button>
              }
            />
            <div className="flex flex-wrap items-center gap-2 border-y border-border px-5 py-3">
              <SearchInput value={query} onChange={setQuery} placeholder="Search this report…" className="w-full max-w-xs" />
              <Select value={range} onChange={handleRangeChange} className="w-auto min-w-[170px]">
                {DATE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
              <Select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-auto min-w-[170px]">
                <option value="all">All Branches</option>
                <option value="current">Current Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>

            {result?.summary && (
              <div className="mx-5 mt-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
                {result.summary}
              </div>
            )}

            <div className="p-5">
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : filteredRows.length === 0 ? (
                <EmptyState icon={SearchX} title="No results" description="No rows match this report or your search filter." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-ink-muted">
                        {result.columns.map((col) => (
                          <th key={col} className="whitespace-nowrap px-3 py-2.5 font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, i) => (
                        <tr key={i} className="border-b border-border-subtle last:border-0 hover:bg-surface-subtle">
                          {row.map((cell, j) => (
                            <td key={j} className="whitespace-nowrap px-3 py-2.5 text-ink">
                              {moneyCols[j] && typeof cell === 'number' ? formatCurrency(cell) : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </PageBody>
    </div>
  )
}
