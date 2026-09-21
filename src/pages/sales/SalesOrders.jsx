import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { SearchInput } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/Badge'
import { salesApi } from '../../api/salesApi'
import { getCustomerName } from '../../data/customers'
import { getProjectName, getProjectById } from '../../data/projects'
import { formatCurrency, formatDate } from '../../utils/format'

export default function SalesOrders() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    salesApi.quotations.all().then((all) => {
      setOrders(all.filter((q) => q.status === 'approved'))
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => o.id.toLowerCase().includes(q) || o.title.toLowerCase().includes(q) || getCustomerName(o.client).toLowerCase().includes(q))
  }, [orders, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    { key: 'id', header: 'Order Ref', render: (o) => <span className="font-medium text-ink">{o.id}</span> },
    { key: 'client', header: 'Client', render: (o) => getCustomerName(o.client) },
    { key: 'project', header: 'Project', render: (o) => getProjectName(o.project) },
    { key: 'value', header: 'Order Value', render: (o) => formatCurrency(salesApi.quotationTotals(o).total, { compact: true }) },
    { key: 'date', header: 'Order Date', render: (o) => formatDate(o.date) },
    {
      key: 'fulfilment', header: 'Fulfilment Status', render: (o) => {
        const project = getProjectById(o.project)
        const status = project?.progress === 100 ? 'Completed' : 'In Progress'
        return <StatusBadge status={status.toLowerCase().replace(' ', '-')} />
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Sales Orders" subtitle={`${filtered.length} confirmed orders from approved quotations`} />
      <PageBody>
        <Card padded={false}>
          <DataTable
            columns={columns}
            data={pageItems}
            loading={loading}
            onRowClick={(row) => navigate(`/sales/quotations/${row.id}`)}
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyState={{ title: 'No sales orders yet', description: 'Approved quotations will appear here as confirmed sales orders.' }}
            toolbar={<SearchInput value={query} onChange={(v) => { setQuery(v); setPage(1) }} placeholder="Search orders…" className="w-full max-w-xs" />}
          />
        </Card>
      </PageBody>
    </div>
  )
}
