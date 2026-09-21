import { useEffect, useMemo, useState } from 'react'
import { UserCheck, UserX, CalendarOff, Clock3 } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { KPICard } from '../../components/ui/Card'
import { SearchInput, Select } from '../../components/ui/Input'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { hrApi } from '../../api/hrApi'
import { getEmployeeById } from '../../data/employees'
import { formatDate } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'

export default function Attendance() {
  const { user } = useAuth()
  const { isRole } = usePermissions()
  // Employee only has hr.viewSelf, so this page becomes a single-row "My
  // Attendance" view scoped to their own employee record — everyone with
  // full hr.view (Admin/HR) still sees the company-wide table with filters.
  const selfOnly = isRole('employee')
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    hrApi.attendanceToday().then((data) => {
      setRecords(selfOnly ? data.filter((r) => r.employee === user?.employeeId) : data)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfOnly])

  const present = records.filter((r) => r.status === 'present').length
  const absent = records.filter((r) => r.status === 'absent').length
  const onLeave = records.filter((r) => r.status === 'on-leave').length
  const late = records.filter((r) => r.late).length

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const emp = getEmployeeById(r.employee)
      if (status !== 'all' && r.status !== status) return false
      if (query && !emp?.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [records, query, status])

  const today = records[0]?.date

  return (
    <div>
      <PageHeader
        title={selfOnly ? 'My Attendance' : 'Attendance'}
        subtitle={today ? `Today's attendance — ${formatDate(today)}` : "Today's attendance"}
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Present Today" value={present} icon={UserCheck} accent="success" trend="neutral" />
              <KPICard label="Absent" value={absent} icon={UserX} accent="warning" trend="neutral" />
              <KPICard label="On Leave" value={onLeave} icon={CalendarOff} accent="info" trend="neutral" />
              <KPICard label="Late Arrivals" value={late} icon={Clock3} accent="brand" trend="neutral" />
            </>
          )}
        </div>

        <Card padded={false}>
          {!selfOnly && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <SearchInput value={query} onChange={setQuery} placeholder="Search employees…" className="w-full max-w-xs" />
              <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto min-w-[140px]">
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="on-leave">On Leave</option>
              </Select>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Check In</th>
                  <th className="px-4 py-3 font-medium">Check Out</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Late</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6}><TableSkeleton cols={6} /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState title="No matching records" /></td></tr>
                ) : (
                  filtered.map((r) => {
                    const emp = getEmployeeById(r.employee)
                    return (
                      <tr key={r.employee} className="border-b border-border-subtle last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={emp?.name || r.employee} size="sm" />
                            <div>
                              <p className="font-medium text-ink">{emp?.name || r.employee}</p>
                              <p className="text-xs text-ink-faint">{emp?.designation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-muted">{r.checkIn || '—'}</td>
                        <td className="px-4 py-3 text-ink-muted">{r.checkOut || '—'}</td>
                        <td className="px-4 py-3 text-ink">{r.hours ? `${r.hours}h` : '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3">{r.late ? <Badge color="warning">Late</Badge> : <span className="text-ink-faint">—</span>}</td>
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
