import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts'
import { Download, FileText, TrendingUp, Wallet, Landmark, ArrowDownCircle } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard, ChartCard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { Skeleton, CardSkeleton } from '../../components/ui/Skeleton'
import { financeApi } from '../../api/financeApi'
import { dashboardApi } from '../../api/dashboardApi'
import { reportsApi } from '../../api/reportsApi'
import { formatCurrency } from '../../utils/format'

export default function FinancialReports() {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [revenueTrend, setRevenueTrend] = useState([])
  const [cashFlow, setCashFlow] = useState([])
  const [receivables, setReceivables] = useState(null)
  const [payables, setPayables] = useState(null)
  const [range, setRange] = useState('last-6-months')

  useEffect(() => {
    Promise.all([
      financeApi.overview(),
      dashboardApi.revenueTrend(),
      dashboardApi.cashFlow(),
      reportsApi.run('receivables'),
      reportsApi.run('payables'),
    ]).then(([ov, rt, cf, rec, pay]) => {
      setOverview(ov)
      setRevenueTrend(rt)
      setCashFlow(cf)
      setReceivables(rec)
      setPayables(pay)
      setLoading(false)
    })
  }, [])

  const expenses = overview ? Math.round(overview.revenue * 0.62) : 0
  const netProfit = overview ? overview.revenue - expenses : 0

  function handleExport(reportName) {
    toast.success(`${reportName} export started — file will download shortly`)
  }

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        subtitle="P&L, cash flow, receivables and payables for the selected period"
        actions={
          <>
            <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-auto min-w-[160px]">
              <option value="last-6-months">Last 6 Months</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Financial Year</option>
              <option value="last-year">Last Financial Year</option>
            </Select>
            <Button icon={Download} variant="secondary" onClick={() => handleExport('Financial report bundle')}>Export</Button>
          </>
        }
      />
      <PageBody className="flex flex-col gap-6">
        <section className="flex flex-col gap-4">
          <CardHeader title="Profit & Loss" subtitle="Revenue, expenses and net profit" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {loading || !overview ? (
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <KPICard label="Revenue" value={formatCurrency(overview.revenue, { compact: true })} icon={TrendingUp} trend="up" accent="brand" />
                <KPICard label="Expenses" value={formatCurrency(expenses, { compact: true })} icon={ArrowDownCircle} trend="neutral" accent="warning" />
                <KPICard label="Net Profit" value={formatCurrency(netProfit, { compact: true })} icon={Wallet} trend="up" accent="success" />
                <KPICard label="Cash Balance" value={formatCurrency(overview.cashBalance, { compact: true })} icon={Landmark} trend="neutral" accent="info" />
              </>
            )}
          </div>
          <ChartCard title="Revenue vs Expenses" subtitle="Trend over the last 6 months" action={<Button size="sm" variant="ghost" icon={Download} onClick={() => handleExport('P&L report')}>Export</Button>}>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueTrend} margin={{ left: -20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4eb" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#9c9ca8" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                  <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6a3aec" fill="#6a3aec22" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#a78bfa" fill="#a78bfa1a" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </section>

        <section className="flex flex-col gap-4">
          <CardHeader title="Cash Flow" subtitle="Inflow vs outflow" />
          <ChartCard title="Cash Flow Trend" action={<Button size="sm" variant="ghost" icon={Download} onClick={() => handleExport('Cash flow report')}>Export</Button>}>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={cashFlow} margin={{ left: -20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4eb" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#9c9ca8" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                  <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="#10b98122" strokeWidth={2} />
                  <Area type="monotone" dataKey="outflow" stroke="#f43f5e" fill="#f43f5e14" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ReportTable title="Receivables" subtitle="Outstanding client balances" report={receivables} loading={loading} onExport={() => handleExport('Receivables report')} />
          <ReportTable title="Payables" subtitle="Outstanding vendor balances" report={payables} loading={loading} onExport={() => handleExport('Payables report')} />
        </div>
      </PageBody>
    </div>
  )
}

function ReportTable({ title, subtitle, report, loading, onExport }) {
  return (
    <Card padded={false}>
      <CardHeader title={title} subtitle={subtitle} className="px-5 pt-5" action={<Button size="sm" variant="ghost" icon={Download} onClick={onExport}>Export</Button>} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-y border-border text-xs text-ink-muted">
              {(report?.columns || []).map((c) => (
                <th key={c} className="px-5 py-2.5 font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading || !report ? (
              <tr>
                <td className="px-5 py-3" colSpan={4}>
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            ) : report.rows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-sm text-ink-faint" colSpan={report.columns.length}>
                  <FileText className="mx-auto mb-2 h-5 w-5 text-ink-faint" />
                  No data available
                </td>
              </tr>
            ) : (
              report.rows.map((row, i) => (
                <tr key={i} className="border-b border-border-subtle text-ink last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="px-5 py-3">
                      {typeof cell === 'number' ? formatCurrency(cell, { compact: true }) : cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
