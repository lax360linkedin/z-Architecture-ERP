import { useEffect, useMemo, useState } from 'react'
import { Landmark, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, KPICard } from '../../components/ui/Card'
import { SearchInput, Select } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { CardSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pagination } from '../../components/ui/Pagination'
import { financeApi } from '../../api/financeApi'
import { getVendorName } from '../../data/vendors'
import { formatCurrency, formatDate } from '../../utils/format'

const PAGE_SIZE = 8
const now = new Date('2024-09-19')

export default function AccountsPayable() {
  const [loading, setLoading] = useState(true)
  const [payables, setPayables] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    financeApi.payables().then((data) => {
      setPayables(data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let items = payables
    if (status !== 'all') items = items.filter((p) => p.status === status)
    if (query) {
      const q = query.toLowerCase()
      items = items.filter((p) => p.id.toLowerCase().includes(q) || p.po.toLowerCase().includes(q) || getVendorName(p.vendor).toLowerCase().includes(q))
    }
    return items
  }, [payables, query, status])

  useEffect(() => setPage(1), [query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalPayable = payables.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0)
  const overduePayable = payables.filter((p) => p.status !== 'paid' && new Date(p.dueDate) < now).reduce((s, p) => s + p.amount, 0)
  const paidThisPeriod = payables.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <PageHeader title="Accounts Payable" subtitle="Vendor purchase invoices awaiting payment" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Payable" value={formatCurrency(totalPayable, { compact: true })} icon={Landmark} trend="neutral" accent="brand" />
              <KPICard label="Overdue Payable" value={formatCurrency(overduePayable, { compact: true })} icon={AlertTriangle} trend="down" accent="warning" />
              <KPICard label="Paid This Period" value={formatCurrency(paidThisPeriod, { compact: true })} icon={CheckCircle2} trend="up" accent="success" />
            </>
          )}
        </div>

        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search PO, invoice or vendor…" className="w-full max-w-xs" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto min-w-[140px]">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">PO Ref</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <TableSkeleton cols={7} />
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState title="No payables found" description="Try adjusting your search or filters." />
                    </td>
                  </tr>
                ) : (
                  pageItems.map((p) => (
                    <tr key={p.id} className="border-b border-border-subtle text-ink last:border-0">
                      <td className="px-4 py-3 font-medium">{p.id}</td>
                      <td className="px-4 py-3 text-ink-muted">{p.po}</td>
                      <td className="px-4 py-3 text-ink-muted">{getVendorName(p.vendor)}</td>
                      <td className="px-4 py-3">{formatCurrency(p.amount, { compact: true })}</td>
                      <td className="px-4 py-3 text-ink-muted">{formatDate(p.date)}</td>
                      <td className="px-4 py-3 text-ink-muted">{formatDate(p.dueDate)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} totalPages={totalPages} onPageChange={setPage} />
          )}
        </Card>
      </PageBody>
    </div>
  )
}
