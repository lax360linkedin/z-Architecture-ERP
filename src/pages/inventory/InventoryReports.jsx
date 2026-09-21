import { useMemo, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, ChartCard } from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { items, getWarehouseName } from '../../data/inventory'
import { formatCurrency } from '../../utils/format'

const COLORS = ['#6a3aec', '#9b8afb', '#c4b5fd', '#4b21b3', '#a78bfa', '#7c3aed', '#8b5cf6', '#5b21b6']
const STATUS_COLORS_MAP = { 'in-stock': '#10b981', 'low-stock': '#f59e0b', 'out-of-stock': '#ef4444' }

export default function InventoryReports() {
  const [range, setRange] = useState('30')

  const categoryValues = useMemo(() => {
    const byCategory = {}
    items.forEach((i) => {
      byCategory[i.category] = (byCategory[i.category] || 0) + i.quantity * i.unitCost
    })
    return Object.entries(byCategory)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
  }, [])

  const statusDistribution = useMemo(() => {
    const counts = { 'in-stock': 0, 'low-stock': 0, 'out-of-stock': 0 }
    items.forEach((i) => { counts[i.status] = (counts[i.status] || 0) + 1 })
    return Object.entries(counts).map(([status, count]) => ({ status, count }))
  }, [])

  const itemsByValue = useMemo(
    () => [...items].map((i) => ({ ...i, value: i.quantity * i.unitCost })).sort((a, b) => b.value - a.value),
    []
  )

  const totalValue = categoryValues.reduce((s, c) => s + c.value, 0)

  return (
    <div>
      <PageHeader
        title="Inventory Reports"
        subtitle="Stock value distribution and item-level analysis"
        actions={
          <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-auto min-w-[150px]">
            <option value="30">Last 30 days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </Select>
        }
      />
      <PageBody className="flex flex-col gap-5">
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-ink-muted">Total Stock Value</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">{formatCurrency(totalValue, { compact: true })}</p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-xs font-medium text-ink-muted">Categories</p>
              <p className="mt-1 text-lg font-semibold text-ink">{categoryValues.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">Total SKUs</p>
              <p className="mt-1 text-lg font-semibold text-ink">{items.length}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard title="Category-wise Value" subtitle="Stock value by material category" className="xl:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryValues} margin={{ left: -10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" fontSize={10} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Bar dataKey="value" name="Stock Value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {categoryValues.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Stock Status" subtitle="Distribution by availability">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusDistribution} dataKey="count" nameKey="status" innerRadius={58} outerRadius={90} paddingAngle={3}>
                  {statusDistribution.map((s) => (
                    <Cell key={s.status} fill={STATUS_COLORS_MAP[s.status]} />
                  ))}
                </Pie>
                <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <Card padded={false}>
          <CardHeader title="Items by Stock Value" subtitle="Highest value items first" className="px-5 pt-5" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-ink-muted">
                  <th className="px-5 py-2.5 font-medium">Item</th>
                  <th className="px-5 py-2.5 font-medium">Category</th>
                  <th className="px-5 py-2.5 font-medium">Warehouse</th>
                  <th className="px-5 py-2.5 font-medium">Quantity</th>
                  <th className="px-5 py-2.5 font-medium">Stock Value</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {itemsByValue.map((i) => (
                  <tr key={i.id} className="border-b border-border-subtle last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{i.name}</p>
                      <p className="text-xs text-ink-faint">{i.sku}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{i.category}</td>
                    <td className="px-5 py-3 text-ink-muted">{getWarehouseName(i.warehouse)}</td>
                    <td className="px-5 py-3 text-ink-muted">{i.quantity} {i.unit}</td>
                    <td className="px-5 py-3 font-medium text-ink">{formatCurrency(i.value, { compact: true })}</td>
                    <td className="px-5 py-3"><StatusBadge status={i.status} /></td>
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
