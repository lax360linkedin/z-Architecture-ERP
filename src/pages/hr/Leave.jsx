import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarDays, Check, X } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { Pills } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/layout/PageLoader'
import { hrApi } from '../../api/hrApi'
import { logAudit } from '../../api/auditLogApi'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { employees, getEmployeeById } from '../../data/employees'
import { formatDate } from '../../utils/format'

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave']
const BALANCE_MAX = { 'Casual Leave': 12, 'Sick Leave': 10, 'Earned Leave': 18 }

export default function Leave() {
  const { user } = useAuth()
  const { can, isRole } = usePermissions()
  const allowDecide = can('hr', 'edit')
  // Employee only has hr.viewSelf — this becomes a "My Leave" view of their
  // own requests and balance, with no approve/reject (that needs hr.edit).
  const selfOnly = isRole('employee')
  const [view, setView] = useState('requests')
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [holidays, setHolidays] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [balances, setBalances] = useState({})

  async function load() {
    setLoading(true)
    const [reqs, hols] = await Promise.all([hrApi.leaveRequests(), hrApi.holidays()])
    setRequests(selfOnly ? reqs.filter((r) => r.employee === user?.employeeId) : reqs)
    setHolidays(hols)
    const balanceEmployees = selfOnly ? employees.filter((e) => e.id === user?.employeeId) : employees.slice(0, 8)
    const balancePairs = await Promise.all(balanceEmployees.map(async (e) => [e.id, await hrApi.leaveBalanceFor(e.id)]))
    setBalances(Object.fromEntries(balancePairs))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfOnly])

  async function handleDecision(id, approve) {
    await hrApi.approveLeave(id, approve)
    logAudit({ user, action: approve ? 'Approved leave request' : 'Rejected leave request', module: 'HR', record: id, change: `status: pending → ${approve ? 'approved' : 'rejected'}` })
    toast.success(approve ? 'Leave approved' : 'Leave rejected')
    load()
  }

  if (loading) return <PageLoader />

  const filteredRequests = statusFilter === 'all' ? requests : requests.filter((r) => r.status === statusFilter)

  return (
    <div>
      <PageHeader
        title={selfOnly ? 'My Leave' : 'Leave Management'}
        subtitle={selfOnly ? `${requests.length} leave request(s)` : `${requests.filter((r) => r.status === 'pending').length} requests awaiting approval`}
        actions={<Pills value={view} onChange={setView} options={[{ value: 'requests', label: 'Requests' }, { value: 'balances', label: 'Balances' }, { value: 'holidays', label: 'Holiday Calendar' }]} />}
      />
      <PageBody>
        {view === 'requests' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[150px]">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            {filteredRequests.length === 0 ? (
              <Card><EmptyState title="No leave requests" description="Leave requests matching this filter will appear here." /></Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredRequests.map((r) => {
                  const emp = getEmployeeById(r.employee)
                  return (
                    <Card key={r.id} className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={emp?.name || r.employee} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-ink">{emp?.name || r.employee}</p>
                            <p className="text-xs text-ink-faint">{r.type}</p>
                          </div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs text-ink-muted">{formatDate(r.from)} – {formatDate(r.to)} · {r.days} day(s)</p>
                      <p className="text-sm text-ink">{r.reason}</p>
                      <p className="text-xs text-ink-faint">Applied {formatDate(r.appliedOn)}</p>
                      {r.status === 'pending' && allowDecide && (
                        <div className="mt-1 flex gap-2 border-t border-border-subtle pt-3">
                          <Button size="sm" variant="secondary" className="flex-1 justify-center" icon={Check} onClick={() => handleDecision(r.id, true)}>Approve</Button>
                          <Button size="sm" variant="ghost" className="flex-1 justify-center" icon={X} onClick={() => handleDecision(r.id, false)}>Reject</Button>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {view === 'balances' && (
          <Card padded={false}>
            <CardHeader title="Leave Balances" subtitle="Remaining days by leave type" className="px-5 pt-5" />
            <div className="divide-y divide-border-subtle">
              {Object.entries(balances).map(([empId, balance]) => {
                const emp = getEmployeeById(empId)
                return (
                  <div key={empId} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5 sm:w-48 sm:shrink-0">
                      <Avatar name={emp?.name || empId} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-ink">{emp?.name || empId}</p>
                        <p className="text-xs text-ink-faint">{emp?.department}</p>
                      </div>
                    </div>
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                      {LEAVE_TYPES.map((type) => (
                        <div key={type}>
                          <div className="flex items-center justify-between text-xs text-ink-muted">
                            <span>{type}</span>
                            <span>{balance[type] ?? 0}/{BALANCE_MAX[type]}</span>
                          </div>
                          <ProgressBar value={((balance[type] ?? 0) / BALANCE_MAX[type]) * 100} color="auto" className="mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {view === 'holidays' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {holidays.length === 0 ? (
              <Card><EmptyState title="No holidays configured" /></Card>
            ) : (
              holidays.map((h) => (
                <Card key={h.id} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950">
                    <CalendarDays className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{h.name}</p>
                    <p className="text-xs text-ink-faint">{formatDate(h.date)}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </PageBody>
    </div>
  )
}
