import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { IndianRupee, TrendingUp, Wallet, Landmark, ArrowDownCircle, AlertTriangle } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard, ChartCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { financeApi } from '../../api/financeApi'
import { dashboardApi } from '../../api/dashboardApi'
import { formatCurrency, formatDate } from '../../utils/format'
import { getCustomerName } from '../../data/customers'
import { getVendorName } from '../../data/vendors'

export default function FinanceOverview() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [revenueTrend, setRevenueTrend] = useState([])
  const [receivablesAging, setReceivablesAging] = useState(null)
  const [payables, setPayables] = useState([])
  const [topOutstanding, setTopOutstanding] = useState([])

  useEffect(() => {
    Promise.all([
      financeApi.overview(),
      dashboardApi.revenueTrend(),
      financeApi.receivablesAging(),
      financeApi.payables(),
      financeApi.invoices.all(),
    ]).then(([ov, rt, aging, pay, invs]) => {
      setOverview(ov)
      setRevenueTrend(rt)
      setReceivablesAging(aging)
      setPayables(pay)
      setTopOutstanding(
        invs
          .filter((i) => i.amount - i.paid > 0)
          .sort((a, b) => b.amount - b.paid - (a.amount - a.paid))
          .slice(0, 6)
      )
      setLoading(false)
    })
  }, [])

  const now = new Date('2024-09-19')
  const payablesAging = (() => {
    const buckets = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
    payables
      .filter((p) => p.status !== 'paid')
      .forEach((p) => {
        const days = Math.floor((now - new Date(p.dueDate)) / 86400000)
        if (days <= 0) buckets.current += p.amount
        else if (days <= 30) buckets['1-30'] += p.amount
        else if (days <= 60) buckets['31-60'] += p.amount
        else if (days <= 90) buckets['61-90'] += p.amount
        else buckets['90+'] += p.amount
      })
    return buckets
  })()

  const receivablesChartData = receivablesAging
    ? Object.entries(receivablesAging).map(([bucket, value]) => ({ bucket, value }))
    : []
  const payablesChartData = Object.entries(payablesAging).map(([bucket, value]) => ({ bucket, value }))

  const expenses = overview ? Math.round(overview.revenue * 0.62) : 0
  const netProfit = overview ? overview.revenue - expenses : 0

  return (
    <div>
      <PageHeader
        title="Finance Overview"
        subtitle="Executive summary of revenue, cash position and outstanding balances"
        actions={
          <Button variant="secondary" size="sm" onClick={() => navigate('/finance/reports')}>
            View Reports
          </Button>
        }
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {loading || !overview ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Revenue" value={formatCurrency(overview.revenue, { compact: true })} icon={IndianRupee} delta="+12.4%" deltaLabel="vs last month" trend="up" accent="brand" />
              <KPICard label="Net Profit" value={formatCurrency(netProfit, { compact: true })} icon={TrendingUp} delta="+8.1%" deltaLabel="vs last month" trend="up" accent="success" />
              <KPICard label="Cash Balance" value={formatCurrency(overview.cashBalance, { compact: true })} icon={Wallet} trend="neutral" accent="info" />
              <KPICard label="Receivable" value={formatCurrency(overview.receivable, { compact: true })} icon={Landmark} delta={`${formatCurrency(overview.collected, { compact: true })} collected`} trend="neutral" accent="warning" />
              <KPICard label="Payable" value={formatCurrency(overview.payable, { compact: true })} icon={ArrowDownCircle} trend="neutral" accent="info" />
              <KPICard label="Overdue" value={formatCurrency(overview.overdue, { compact: true })} icon={AlertTriangle} trend="down" accent="warning" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard title="Revenue vs Expenses" subtitle="Last 6 months" className="xl:col-span-2">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueTrend} margin={{ left: -20, top: 10 }}>
                  <defs>
                    <linearGradient id="fo-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6a3aec" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#6a3aec" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fo-exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4eb" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                  <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6a3aec" strokeWidth={2.5} fill="url(#fo-rev)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#a78bfa" strokeWidth={2.5} fill="url(#fo-exp)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Receivables Aging" subtitle="Outstanding by bucket">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={receivablesChartData} margin={{ left: -20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bucket" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={60} />
                  <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Bar dataKey="value" name="Amount" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard title="Payables Aging" subtitle="Vendor dues by bucket">
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={payablesChartData} margin={{ left: -20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bucket" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={60} />
                  <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Bar dataKey="value" name="Amount" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <Card padded={false} className="xl:col-span-2">
            <CardHeader title="Top Outstanding Invoices" subtitle="Highest pending balances" className="px-5 pt-5" action={<Button size="sm" variant="ghost" onClick={() => navigate('/finance/receivables')}>View all</Button>} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-y border-border text-xs text-ink-muted">
                    <th className="px-5 py-2.5 font-medium">Invoice</th>
                    <th className="px-5 py-2.5 font-medium">Client</th>
                    <th className="px-5 py-2.5 font-medium">Due Date</th>
                    <th className="px-5 py-2.5 font-medium">Balance</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-border-subtle">
                          <td className="px-5 py-3" colSpan={5}>
                            <Skeleton className="h-5 w-full" />
                          </td>
                        </tr>
                      ))
                    : topOutstanding.map((i) => (
                        <tr key={i.id} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-surface-subtle" onClick={() => navigate(`/billing/invoices/${i.id}`)}>
                          <td className="px-5 py-3 font-medium text-ink">{i.id}</td>
                          <td className="px-5 py-3 text-ink-muted">{getCustomerName(i.client)}</td>
                          <td className="px-5 py-3 text-ink-muted">{formatDate(i.dueDate)}</td>
                          <td className="px-5 py-3 font-medium text-ink">{formatCurrency(i.amount - i.paid, { compact: true })}</td>
                          <td className="px-5 py-3">
                            <StatusBadge status={i.status} />
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </PageBody>
    </div>
  )
}
