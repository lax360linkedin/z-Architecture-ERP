import { useEffect, useMemo, useState } from 'react'
import { Warehouse, IndianRupee, AlertTriangle, XCircle, Boxes } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard } from '../../components/ui/Card'
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatusBadge } from '../../components/ui/Badge'
import { inventoryApi } from '../../api/inventoryApi'
import { items, warehouses, getWarehouseName } from '../../data/inventory'
import { formatCurrency } from '../../utils/format'

export default function Stock() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    inventoryApi.summary().then((s) => {
      setSummary(s)
      setLoading(false)
    })
  }, [])

  const warehouseBreakdown = useMemo(() => {
    return warehouses.map((w) => {
      const wItems = items.filter((i) => i.warehouse === w.id)
      const value = wItems.reduce((s, i) => s + i.quantity * i.unitCost, 0)
      return { ...w, itemCount: wItems.length, value }
    })
  }, [])

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.quantity / (a.reorderLevel || 1) - b.quantity / (b.reorderLevel || 1)), [])

  return (
    <div>
      <PageHeader title="Stock Overview" subtitle="Live stock levels and inventory value across the organization" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading || !summary ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Inventory Value" value={formatCurrency(summary.totalValue, { compact: true })} icon={IndianRupee} accent="brand" trend="neutral" />
              <KPICard label="Total Items" value={summary.totalItems} icon={Boxes} accent="info" trend="neutral" />
              <KPICard label="Low Stock" value={summary.lowStock} icon={AlertTriangle} accent="warning" trend="neutral" />
              <KPICard label="Out of Stock" value={summary.outOfStock} icon={XCircle} accent="danger" trend="neutral" />
            </>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">Warehouse Breakdown</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              warehouseBreakdown.map((w) => (
                <Card key={w.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950">
                      <Warehouse className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{w.name}</p>
                      <p className="text-xs text-ink-faint">{w.location}</p>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-border-subtle pt-2.5">
                    <div>
                      <p className="text-xs text-ink-faint">Items</p>
                      <p className="text-sm font-medium text-ink">{w.itemCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-faint">Stock Value</p>
                      <p className="text-sm font-medium text-ink">{formatCurrency(w.value, { compact: true })}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <Card padded={false}>
          <CardHeader title="Stock Levels" subtitle="Quantity on hand vs reorder threshold" className="px-5 pt-5" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-ink-muted">
                  <th className="px-5 py-2.5 font-medium">Item</th>
                  <th className="px-5 py-2.5 font-medium">Warehouse</th>
                  <th className="px-5 py-2.5 font-medium">Quantity</th>
                  <th className="px-5 py-2.5 font-medium">Stock Level</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border-subtle">
                        <td className="px-5 py-3" colSpan={5}><Skeleton className="h-5 w-full" /></td>
                      </tr>
                    ))
                  : sortedItems.map((i) => {
                      const full = Math.max(i.reorderLevel * 3, 1)
                      const pct = Math.round((i.quantity / full) * 100)
                      return (
                        <tr key={i.id} className="border-b border-border-subtle last:border-0">
                          <td className="px-5 py-3">
                            <p className="font-medium text-ink">{i.name}</p>
                            <p className="text-xs text-ink-faint">{i.sku}</p>
                          </td>
                          <td className="px-5 py-3 text-ink-muted">{getWarehouseName(i.warehouse)}</td>
                          <td className="px-5 py-3 text-ink-muted">{i.quantity} {i.unit}</td>
                          <td className="px-5 py-3">
                            <ProgressBar value={pct} color="auto" showLabel className="w-40" />
                          </td>
                          <td className="px-5 py-3"><StatusBadge status={i.status} /></td>
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
