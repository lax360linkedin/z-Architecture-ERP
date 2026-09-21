import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, Clock3, AlertCircle, AlertTriangle, Skull } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, KPICard } from '../../components/ui/Card'
import { SearchInput, Select } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { useDataTable } from '../../hooks/useDataTable'
import { financeApi } from '../../api/financeApi'
import { searchItems, sortItems, paginate } from '../../api/mockClient'
import { getCustomerName } from '../../data/customers'
import { getProjectName } from '../../data/projects'
import { formatCurrency, formatDate } from '../../utils/format'

const STATUS_OPTIONS = ['pending', 'partially-paid', 'overdue', 'paid']

async function fetchReceivables({ query, page, pageSize, sortBy, sortDir, filters }) {
  let items = await financeApi.invoices.all()
  if (filters.status === 'outstanding') items = items.filter((i) => i.status !== 'paid')
  else if (filters.status && filters.status !== 'all') items = items.filter((i) => i.status === filters.status)
  items = searchItems(items, query, ['id'])
  items = sortItems(items, sortBy, sortDir)
  return paginate(items, { page, pageSize })
}

export default function AccountsReceivable() {
  const navigate = useNavigate()
  const table = useDataTable(fetchReceivables, { pageSize: 8, initialFilters: { status: 'outstanding' }, initialSort: { by: 'dueDate', dir: 'asc' } })
  const [loading, setLoading] = useState(true)
  const [aging, setAging] = useState(null)

  useEffect(() => {
    financeApi.receivablesAging().then((a) => {
      setAging(a)
      setLoading(false)
    })
  }, [])

  const columns = [
    { key: 'id', header: 'Invoice ID', sortable: true },
    { key: 'client', header: 'Client', render: (i) => getCustomerName(i.client) },
    { key: 'project', header: 'Project', render: (i) => getProjectName(i.project) },
    { key: 'date', header: 'Date', sortable: true, render: (i) => formatDate(i.date) },
    { key: 'dueDate', header: 'Due Date', sortable: true, render: (i) => formatDate(i.dueDate) },
    { key: 'amount', header: 'Amount', sortable: true, render: (i) => formatCurrency(i.amount, { compact: true }) },
    { key: 'paid', header: 'Paid', render: (i) => formatCurrency(i.paid, { compact: true }) },
    { key: 'balance', header: 'Balance', render: (i) => <span className="font-medium">{formatCurrency(i.amount - i.paid, { compact: true })}</span> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
  ]

  return (
    <div>
      <PageHeader title="Accounts Receivable" subtitle="Outstanding client invoices and aging position" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {loading || !aging ? (
            Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Current" value={formatCurrency(aging.current, { compact: true })} icon={IndianRupee} trend="neutral" accent="success" />
              <KPICard label="1-30 Days" value={formatCurrency(aging['1-30'], { compact: true })} icon={Clock3} trend="neutral" accent="info" />
              <KPICard label="31-60 Days" value={formatCurrency(aging['31-60'], { compact: true })} icon={AlertCircle} trend="neutral" accent="warning" />
              <KPICard label="61-90 Days" value={formatCurrency(aging['61-90'], { compact: true })} icon={AlertTriangle} trend="neutral" accent="warning" />
              <KPICard label="90+ Days" value={formatCurrency(aging['90+'], { compact: true })} icon={Skull} trend="down" accent="warning" />
            </>
          )}
        </div>

        <Card padded={false}>
          <DataTable
            columns={columns}
            data={table.items}
            loading={table.loading}
            error={table.error}
            onRetry={table.refresh}
            sort={table.sort}
            onSortChange={table.toggleSort}
            onRowClick={(row) => navigate(`/billing/invoices/${row.id}`)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No receivables found', description: 'Try changing your filters.' }}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search invoice ID…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="outstanding">Outstanding</option>
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>
    </div>
  )
}
