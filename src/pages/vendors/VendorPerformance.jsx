import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell } from 'recharts'
import { Star } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, ChartCard, KPICard } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { vendors } from '../../data/vendors'
import { purchaseOrders } from '../../data/procurement'
import { formatCurrency } from '../../utils/format'

const COLORS = ['#6a3aec', '#9b8afb', '#c4b5fd', '#4b21b3', '#a78bfa', '#7c3aed', '#8b5cf6', '#5b21b6']

function computeVendorMetrics() {
  return vendors.map((v) => {
    const orders = purchaseOrders.filter((po) => po.vendor === v.id)
    const totalValue = orders.reduce((s, o) => s + o.quantity * o.rate, 0)
    const delivered = orders.filter((o) => o.status === 'delivered').length
    const onTimeRate = orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0
    return { ...v, orderCount: orders.length, totalValue, onTimeRate }
  })
}

export default function VendorPerformance() {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState('totalValue')
  const metrics = useMemo(() => computeVendorMetrics(), [])

  const sorted = useMemo(() => [...metrics].sort((a, b) => b[sortKey] - a[sortKey]), [metrics, sortKey])

  const topByValue = useMemo(() => [...metrics].filter((v) => v.totalValue > 0).sort((a, b) => b.totalValue - a.totalValue).slice(0, 8), [metrics])
  const ratingDistribution = useMemo(() => [...metrics].sort((a, b) => b.rating - a.rating).slice(0, 8), [metrics])

  const avgRating = (metrics.reduce((s, v) => s + v.rating, 0) / (metrics.length || 1)).toFixed(1)
  const avgOnTime = Math.round(metrics.filter((v) => v.orderCount > 0).reduce((s, v) => s + v.onTimeRate, 0) / (metrics.filter((v) => v.orderCount > 0).length || 1))
  const totalPoValue = metrics.reduce((s, v) => s + v.totalValue, 0)

  function toggleSort(key) {
    setSortKey(key)
  }

  return (
    <div>
      <PageHeader title="Vendor Performance" subtitle="On-time delivery, PO value and rating across all vendors" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard label="Total Vendors" value={vendors.length} accent="brand" trend="neutral" />
          <KPICard label="Avg. Rating" value={`${avgRating} / 5`} accent="warning" trend="neutral" />
          <KPICard label="Avg. On-Time Delivery" value={`${avgOnTime}%`} accent="success" trend="neutral" />
          <KPICard label="Total PO Value" value={formatCurrency(totalPoValue, { compact: true })} accent="info" trend="neutral" />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Top Vendors by PO Value" subtitle="Total purchase order value">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topByValue} layout="vertical" margin={{ left: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <YAxis type="category" dataKey="name" width={140} tickLine={false} axisLine={false} fontSize={11} stroke="#9c9ca8" />
                <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Bar dataKey="totalValue" name="PO Value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {topByValue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Rating Distribution" subtitle="Top rated vendors">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ratingDistribution} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis domain={[0, 5]} tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" width={30} />
                <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Bar dataKey="rating" name="Rating" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <Card padded={false}>
          <CardHeader
            title="All Vendors"
            subtitle="Click a column to sort"
            className="px-5 pt-5"
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-ink-muted">
                  <th className="px-5 py-2.5 font-medium">Vendor</th>
                  <th className="px-5 py-2.5 font-medium">Category</th>
                  <th className="px-5 py-2.5 font-medium">
                    <button onClick={() => toggleSort('onTimeRate')} className="hover:text-ink">On-Time Delivery</button>
                  </th>
                  <th className="px-5 py-2.5 font-medium">
                    <button onClick={() => toggleSort('totalValue')} className="hover:text-ink">Total PO Value</button>
                  </th>
                  <th className="px-5 py-2.5 font-medium">
                    <button onClick={() => toggleSort('rating')} className="hover:text-ink">Rating</button>
                  </th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((v) => (
                  <tr key={v.id} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-surface-subtle" onClick={() => navigate(`/vendors/${v.id}`)}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{v.name}</p>
                      <p className="text-xs text-ink-faint">{v.city}</p>
                    </td>
                    <td className="px-5 py-3"><Badge>{v.category}</Badge></td>
                    <td className="px-5 py-3">
                      <ProgressBar value={v.onTimeRate} color="auto" showLabel className="w-32" />
                    </td>
                    <td className="px-5 py-3 font-medium text-ink">{formatCurrency(v.totalValue, { compact: true })}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 font-medium text-ink"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{v.rating.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
