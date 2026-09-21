import { useMemo, useState } from 'react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Pills } from '../../components/ui/Tabs'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { invoices } from '../../data/invoices'
import { purchaseInvoices } from '../../data/procurement'
import { getCustomerName } from '../../data/customers'
import { getVendorName } from '../../data/vendors'
import { formatCurrency, formatDate } from '../../utils/format'

export default function GeneralLedger() {
  const [accountType, setAccountType] = useState('all')

  const entries = useMemo(() => {
    const revenueEntries = invoices.map((i) => ({
      id: `led-rev-${i.id}`,
      date: i.date,
      account: 'Revenue',
      description: `Invoice ${i.id} — ${getCustomerName(i.client)}`,
      debit: 0,
      credit: i.amount,
    }))
    const expenseEntries = purchaseInvoices.map((p) => ({
      id: `led-exp-${p.id}`,
      date: p.date,
      account: 'Expense',
      description: `Purchase Invoice ${p.id} — ${getVendorName(p.vendor)} (${p.po})`,
      debit: p.amount,
      credit: 0,
    }))
    const chronological = [...revenueEntries, ...expenseEntries].sort((a, b) => new Date(a.date) - new Date(b.date))
    let balance = 0
    return chronological.map((e) => {
      balance += e.credit - e.debit
      return { ...e, balance }
    })
  }, [])

  const filtered = accountType === 'all' ? entries : entries.filter((e) => e.account.toLowerCase() === accountType)

  const totalDebit = filtered.reduce((s, e) => s + e.debit, 0)
  const totalCredit = filtered.reduce((s, e) => s + e.credit, 0)

  return (
    <div>
      <PageHeader
        title="General Ledger"
        subtitle="Chronological revenue and expense entries across all accounts"
        actions={
          <Pills
            value={accountType}
            onChange={setAccountType}
            options={[
              { value: 'all', label: 'All' },
              { value: 'revenue', label: 'Revenue' },
              { value: 'expense', label: 'Expense' },
            ]}
          />
        }
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs font-medium text-ink-muted">Total Debit</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">{formatCurrency(totalDebit, { compact: true })}</p>
          </Card>
          <Card>
            <p className="text-xs font-medium text-ink-muted">Total Credit</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">{formatCurrency(totalCredit, { compact: true })}</p>
          </Card>
          <Card>
            <p className="text-xs font-medium text-ink-muted">Net Balance</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">{formatCurrency(totalCredit - totalDebit, { compact: true })}</p>
          </Card>
        </div>

        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Debit</th>
                  <th className="px-4 py-3 font-medium">Credit</th>
                  <th className="px-4 py-3 font-medium">Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState title="No ledger entries" description="Try a different account filter." />
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.id} className="border-b border-border-subtle text-ink last:border-0">
                      <td className="px-4 py-3 text-ink-muted">{formatDate(e.date)}</td>
                      <td className="px-4 py-3">
                        <Badge color={e.account === 'Revenue' ? 'success' : 'danger'}>{e.account}</Badge>
                      </td>
                      <td className="px-4 py-3">{e.description}</td>
                      <td className="px-4 py-3 text-ink-muted">{e.debit ? formatCurrency(e.debit, { compact: true }) : '—'}</td>
                      <td className="px-4 py-3 text-ink-muted">{e.credit ? formatCurrency(e.credit, { compact: true }) : '—'}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(e.balance, { compact: true })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
