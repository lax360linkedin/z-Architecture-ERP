import { useMemo, useState } from 'react'
import { Wallet, CalendarDays, Clock3 } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, KPICard } from '../../components/ui/Card'
import { SearchInput, Select } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pagination } from '../../components/ui/Pagination'
import { purchaseOrders, purchaseInvoices } from '../../data/procurement'
import { getVendorById, getVendorName, vendorCategories } from '../../data/vendors'
import { getProjectName } from '../../data/projects'
import { formatCurrency, formatDate } from '../../utils/format'

const PAGE_SIZE = 8

function buildExpenses() {
  const poExpenses = purchaseOrders.map((po) => ({
    id: po.id,
    date: po.date,
    category: getVendorById(po.vendor)?.category || 'Uncategorized',
    vendor: po.vendor,
    project: po.project,
    amount: po.rate * po.quantity,
    status: po.status === 'delivered' ? 'paid' : po.status === 'in-progress' ? 'pending' : po.status,
    source: 'Purchase Order',
  }))
  const invoiceExpenses = purchaseInvoices.map((p) => ({
    id: p.id,
    date: p.date,
    category: getVendorById(p.vendor)?.category || 'Uncategorized',
    vendor: p.vendor,
    project: purchaseOrders.find((po) => po.id === p.po)?.project || null,
    amount: p.amount,
    status: p.status,
    source: 'Purchase Invoice',
  }))
  return [...poExpenses, ...invoiceExpenses].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function Expenses() {
  const [expenses] = useState(buildExpenses)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let items = expenses
    if (category !== 'all') items = items.filter((e) => e.category === category)
    if (query) {
      const q = query.toLowerCase()
      items = items.filter((e) => e.id.toLowerCase().includes(q) || getVendorName(e.vendor).toLowerCase().includes(q))
    }
    return items
  }, [expenses, query, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const thisMonth = expenses.filter((e) => e.date?.startsWith('2024-09')).reduce((s, e) => s + e.amount, 0)
  const pendingPayments = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Purchase orders and vendor invoices treated as project expenses" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KPICard label="Total Expenses" value={formatCurrency(totalExpenses, { compact: true })} icon={Wallet} trend="neutral" accent="brand" />
          <KPICard label="This Month (Sep 2024)" value={formatCurrency(thisMonth, { compact: true })} icon={CalendarDays} trend="neutral" accent="info" />
          <KPICard label="Pending Payments" value={formatCurrency(pendingPayments, { compact: true })} icon={Clock3} trend="down" accent="warning" />
        </div>

        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <SearchInput value={query} onChange={(v) => { setQuery(v); setPage(1) }} placeholder="Search expense ID or vendor…" className="w-full max-w-xs" />
            <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="w-auto min-w-[160px]">
              <option value="all">All Categories</option>
              {vendorCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState title="No expenses found" description="Try adjusting your search or category filter." />
                    </td>
                  </tr>
                ) : (
                  pageItems.map((e) => (
                    <tr key={e.id} className="border-b border-border-subtle text-ink last:border-0">
                      <td className="px-4 py-3 text-ink-muted">{formatDate(e.date)}</td>
                      <td className="px-4 py-3 font-medium">{e.id}</td>
                      <td className="px-4 py-3 text-ink-muted">{e.category}</td>
                      <td className="px-4 py-3 text-ink-muted">{getVendorName(e.vendor)}</td>
                      <td className="px-4 py-3 text-ink-muted">{e.project ? getProjectName(e.project) : '—'}</td>
                      <td className="px-4 py-3">{formatCurrency(e.amount, { compact: true })}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} totalPages={totalPages} onPageChange={setPage} />
          )}
        </Card>
      </PageBody>
    </div>
  )
}
