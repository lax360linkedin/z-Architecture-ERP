import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IndianRupee, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, KPICard } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { CardSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { financeApi } from '../../api/financeApi'
import { getCustomerName } from '../../data/customers'
import { getProjectName } from '../../data/projects'
import { formatCurrency, formatDate } from '../../utils/format'

const TODAY = new Date('2024-09-19')

function dueStatus(dueDate, balance) {
  if (balance <= 0) return { label: 'Settled', color: 'success', days: 0 }
  const days = Math.floor((TODAY - new Date(dueDate)) / 86400000)
  if (days > 0) return { label: `${days}d overdue`, color: 'danger', days }
  if (days > -7) return { label: `Due in ${-days}d`, color: 'warning', days }
  return { label: 'Current', color: 'success', days }
}

export default function PaymentTracking() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    Promise.all([financeApi.overview(), financeApi.invoices.all()]).then(([ov, invs]) => {
      setOverview(ov)
      setInvoices(invs)
      setLoading(false)
    })
  }, [])

  const sorted = useMemo(
    () => [...invoices].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [invoices]
  )

  return (
    <div>
      <PageHeader title="Payment Tracking" subtitle="Live status of every invoice, sorted by due date" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading || !overview ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Invoiced" value={formatCurrency(overview.revenue, { compact: true })} icon={IndianRupee} trend="neutral" accent="brand" />
              <KPICard label="Total Collected" value={formatCurrency(overview.collected, { compact: true })} icon={CheckCircle2} trend="up" accent="success" />
              <KPICard label="Total Outstanding" value={formatCurrency(overview.receivable, { compact: true })} icon={Clock3} trend="neutral" accent="warning" />
              <KPICard label="Overdue Amount" value={formatCurrency(overview.overdue, { compact: true })} icon={AlertTriangle} trend="down" accent="warning" />
            </>
          )}
        </div>

        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Tracking</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <TableSkeleton cols={7} />
                    </td>
                  </tr>
                ) : (
                  sorted.map((i) => {
                    const balance = i.amount - i.paid
                    const status = dueStatus(i.dueDate, balance)
                    return (
                      <tr
                        key={i.id}
                        className="cursor-pointer border-b border-border-subtle text-ink last:border-0 hover:bg-surface-subtle"
                        onClick={() => navigate(`/billing/invoices/${i.id}`)}
                      >
                        <td className="px-4 py-3 font-medium">{i.id}</td>
                        <td className="px-4 py-3 text-ink-muted">{getCustomerName(i.client)}</td>
                        <td className="px-4 py-3 text-ink-muted">{getProjectName(i.project)}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatDate(i.dueDate)}</td>
                        <td className="px-4 py-3">{formatCurrency(i.amount, { compact: true })}</td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(balance, { compact: true })}</td>
                        <td className="px-4 py-3">
                          <Badge color={status.color} dot>{status.label}</Badge>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
