import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard, ChartCard } from '../../components/ui/Card'
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { dashboardApi } from '../../api/dashboardApi'
import { financeApi } from '../../api/financeApi'
import { formatCurrency } from '../../utils/format'

export default function CashFlow() {
  const [loading, setLoading] = useState(true)
  const [cashFlow, setCashFlow] = useState([])
  const [cashBalance, setCashBalance] = useState(0)

  useEffect(() => {
    Promise.all([dashboardApi.cashFlow(), financeApi.overview()]).then(([cf, ov]) => {
      setCashFlow(cf)
      setCashBalance(ov.cashBalance)
      setLoading(false)
    })
  }, [])

  const totalInflow = cashFlow.reduce((s, m) => s + m.inflow, 0)
  const totalOutflow = cashFlow.reduce((s, m) => s + m.outflow, 0)
  const netCashFlow = totalInflow - totalOutflow

  return (
    <div>
      <PageHeader title="Cash Flow" subtitle="Monthly inflow and outflow across the last 6 months" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Net Cash Flow" value={formatCurrency(netCashFlow, { compact: true })} icon={TrendingUp} trend={netCashFlow >= 0 ? 'up' : 'down'} accent="brand" />
              <KPICard label="Total Inflow" value={formatCurrency(totalInflow, { compact: true })} icon={ArrowUpCircle} trend="up" accent="success" />
              <KPICard label="Total Outflow" value={formatCurrency(totalOutflow, { compact: true })} icon={ArrowDownCircle} trend="down" accent="warning" />
              <KPICard label="Closing Balance" value={formatCurrency(cashBalance, { compact: true })} icon={Wallet} trend="neutral" accent="info" />
            </>
          )}
        </div>

        <ChartCard title="Cash Flow Trend" subtitle="Inflow vs outflow, last 6 months">
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={cashFlow} margin={{ left: -10, top: 10 }}>
                <defs>
                  <linearGradient id="cf-in" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cf-out" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4eb" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#9c9ca8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="inflow" name="Inflow" stroke="#10b981" fill="url(#cf-in)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="outflow" name="Outflow" stroke="#f43f5e" fill="url(#cf-out)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <Card padded={false}>
          <CardHeader title="Monthly Breakdown" subtitle="Inflow, outflow and net position by month" className="px-5 pt-5" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-ink-muted">
                  <th className="px-5 py-2.5 font-medium">Month</th>
                  <th className="px-5 py-2.5 font-medium">Inflow</th>
                  <th className="px-5 py-2.5 font-medium">Outflow</th>
                  <th className="px-5 py-2.5 font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-border-subtle">
                        <td className="px-5 py-3" colSpan={4}>
                          <Skeleton className="h-5 w-full" />
                        </td>
                      </tr>
                    ))
                  : cashFlow.map((m) => {
                      const net = m.inflow - m.outflow
                      return (
                        <tr key={m.month} className="border-b border-border-subtle last:border-0">
                          <td className="px-5 py-3 font-medium text-ink">{m.month}</td>
                          <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(m.inflow, { compact: true })}</td>
                          <td className="px-5 py-3 text-red-600 dark:text-red-400">{formatCurrency(m.outflow, { compact: true })}</td>
                          <td className={`px-5 py-3 font-medium ${net >= 0 ? 'text-ink' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(net, { compact: true })}</td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
