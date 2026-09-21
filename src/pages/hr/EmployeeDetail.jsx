import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, FolderKanban, Clock3 } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Timeline } from '../../components/ui/Timeline'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { PageLoader } from '../../components/layout/PageLoader'
import { hrApi } from '../../api/hrApi'
import { getEmployeeName } from '../../data/employees'
import { projects } from '../../data/projects'
import { timesheets } from '../../data/timesheets'
import { activityFeed } from '../../data/tasks'
import { formatCurrency, formatDate } from '../../utils/format'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'personal', label: 'Personal' },
  { value: 'employment', label: 'Employment' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'leave', label: 'Leave' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'documents', label: 'Documents' },
  { value: 'projects', label: 'Projects' },
  { value: 'timesheets', label: 'Timesheets' },
  { value: 'performance', label: 'Performance' },
  { value: 'activity', label: 'Activity' },
]

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState(null)
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [attendance, setAttendance] = useState([])
  const [salary, setSalary] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      hrApi.employees.get(id),
      hrApi.leaveBalanceFor(id),
      hrApi.leaveRequests(),
      hrApi.attendanceToday(),
      hrApi.salaryStructures(),
    ]).then(([emp, balance, leaves, att, salaries]) => {
      if (!active) return
      setEmployee(emp)
      setLeaveBalance(balance)
      setLeaveRequests(leaves.filter((l) => l.employee === id))
      setAttendance(att.filter((a) => a.employee === id))
      setSalary(salaries.find((s) => s.employee === id) || null)
      setLoading(false)
    })
    return () => { active = false }
  }, [id])

  const empProjects = useMemo(() => projects.filter((p) => p.team?.includes(id) || p.manager === id), [id])
  const empTimesheets = useMemo(() => timesheets.filter((t) => t.employee === id), [id])
  const totalHours = empTimesheets.reduce((s, t) => s + t.hours, 0)
  const billableHours = empTimesheets.filter((t) => t.billable).reduce((s, t) => s + t.hours, 0)
  const empActivity = useMemo(
    () => activityFeed.filter((a) => a.user === id).map((a) => ({ ...a, title: `${a.action} ${a.target}`, time: a.time })),
    [id]
  )

  if (loading) return <PageLoader />

  if (!employee) {
    return (
      <div>
        <PageHeader title="Employee not found" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/hr/employees')}>Back</Button>} />
        <PageBody><EmptyState title="This employee doesn't exist" description="They may have been removed from the roster." /></PageBody>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={
          <button onClick={() => navigate('/hr/employees')} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Employees
          </button>
        }
        subtitle={null}
        className="pb-0"
      />
      <div className="border-b border-border bg-surface-raised px-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar name={employee.name} size="lg" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{employee.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{employee.designation} · {employee.department}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{employee.location}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{employee.phone}</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{employee.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={employee.status} />
            <Badge color="brand">{employee.id}</Badge>
          </div>
        </div>
        <Tabs tabs={TABS} value={tab} onChange={setTab} className="mt-5 -mb-5 border-b-0" />
      </div>

      <PageBody>
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <KPICard label="Active Projects" value={empProjects.length} icon={FolderKanban} accent="brand" trend="neutral" />
            <KPICard label="Timesheet Hours" value={`${totalHours}h`} icon={Clock3} accent="info" trend="neutral" />
            <KPICard label="Casual Leave Left" value={leaveBalance?.['Casual Leave'] ?? '—'} icon={Calendar} accent="success" trend="neutral" />
            <KPICard label="Tenure" value={`${tenureYears(employee.joiningDate)} yrs`} icon={Building2} accent="warning" trend="neutral" />
            <Card className="lg:col-span-4">
              <CardHeader title="Employment Summary" />
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div><p className="text-xs text-ink-faint">Employee ID</p><p className="mt-0.5 font-medium text-ink">{employee.id}</p></div>
                <div><p className="text-xs text-ink-faint">Role</p><p className="mt-0.5 font-medium text-ink">{employee.role}</p></div>
                <div><p className="text-xs text-ink-faint">Manager</p><p className="mt-0.5 font-medium text-ink">{employee.manager ? getEmployeeName(employee.manager) : '—'}</p></div>
                <div><p className="text-xs text-ink-faint">Joining Date</p><p className="mt-0.5 font-medium text-ink">{formatDate(employee.joiningDate)}</p></div>
              </div>
            </Card>
          </div>
        )}

        {tab === 'personal' && (
          <Card>
            <CardHeader title="Personal Details" />
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div><p className="text-xs text-ink-faint">Full Name</p><p className="mt-0.5 font-medium text-ink">{employee.name}</p></div>
              <div><p className="text-xs text-ink-faint">Email</p><p className="mt-0.5 font-medium text-ink">{employee.email}</p></div>
              <div><p className="text-xs text-ink-faint">Phone</p><p className="mt-0.5 font-medium text-ink">{employee.phone}</p></div>
              <div><p className="text-xs text-ink-faint">Location</p><p className="mt-0.5 font-medium text-ink">{employee.location}</p></div>
              <div><p className="text-xs text-ink-faint">Status</p><p className="mt-0.5"><StatusBadge status={employee.status} /></p></div>
            </div>
          </Card>
        )}

        {tab === 'employment' && (
          <Card>
            <CardHeader title="Employment Details" />
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div><p className="text-xs text-ink-faint">Designation</p><p className="mt-0.5 font-medium text-ink">{employee.designation}</p></div>
              <div><p className="text-xs text-ink-faint">Department</p><p className="mt-0.5 font-medium text-ink">{employee.department}</p></div>
              <div><p className="text-xs text-ink-faint">Role</p><p className="mt-0.5 font-medium text-ink">{employee.role}</p></div>
              <div><p className="text-xs text-ink-faint">Manager</p><p className="mt-0.5 font-medium text-ink">{employee.manager ? getEmployeeName(employee.manager) : 'None — top of hierarchy'}</p></div>
              <div><p className="text-xs text-ink-faint">Joining Date</p><p className="mt-0.5 font-medium text-ink">{formatDate(employee.joiningDate)}</p></div>
              <div><p className="text-xs text-ink-faint">Tenure</p><p className="mt-0.5 font-medium text-ink">{tenureYears(employee.joiningDate)} years</p></div>
            </div>
          </Card>
        )}

        {tab === 'attendance' && (
          <Card padded={false}>
            {attendance.length === 0 ? (
              <EmptyState title="No attendance record for today" description="Attendance data is only tracked for today's date in this demo dataset." />
            ) : (
              <div className="divide-y divide-border-subtle">
                {attendance.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-ink">{formatDate(a.date)}</p>
                      <p className="text-xs text-ink-faint">Check-in {a.checkIn || '—'} · Check-out {a.checkOut || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{a.hours}h logged</p>
                      <div className="mt-1 flex items-center gap-1.5 justify-end">
                        <StatusBadge status={a.status} />
                        {a.late && <Badge color="warning">Late</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
                <p className="px-4 pb-4 text-xs text-ink-faint">Only today's attendance record is available in this dataset.</p>
              </div>
            )}
          </Card>
        )}

        {tab === 'leave' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Object.entries(leaveBalance || {}).map(([type, days]) => (
                <KPICard key={type} label={type} value={`${days} days`} icon={Calendar} accent="brand" trend="neutral" />
              ))}
            </div>
            <Card padded={false}>
              {leaveRequests.length === 0 ? <EmptyState title="No leave requests" description="This employee hasn't applied for leave yet." /> : (
                <div className="divide-y divide-border-subtle">
                  {leaveRequests.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-ink">{l.type}</p>
                        <p className="text-xs text-ink-faint">{formatDate(l.from)} – {formatDate(l.to)} · {l.days} day(s)</p>
                        <p className="mt-0.5 text-xs text-ink-faint">{l.reason}</p>
                      </div>
                      <StatusBadge status={l.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === 'payroll' && (
          <div>
            {!salary ? (
              <Card><EmptyState title="No salary structure on file" description="Payroll has not been configured for this employee yet." /></Card>
            ) : (
              <Card className="max-w-xl">
                <CardHeader title="Salary Structure" subtitle="Monthly breakdown" />
                <div className="flex flex-col divide-y divide-border-subtle text-sm">
                  <Row label="Basic" value={salary.basic} />
                  <Row label="HRA" value={salary.hra} />
                  <Row label="Allowances" value={salary.allowances} />
                  <Row label="Provident Fund" value={-salary.pf} />
                  <Row label="Tax Deducted (TDS)" value={-salary.tax} />
                  <div className="flex items-center justify-between py-3">
                    <p className="font-semibold text-ink">Net Pay</p>
                    <p className="text-base font-bold text-brand-600">{formatCurrency(salary.netPay)}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === 'documents' && (
          <Card><EmptyState title="No documents uploaded" description="Employee documents such as ID proofs, contracts and certificates will appear here." /></Card>
        )}

        {tab === 'projects' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {empProjects.length === 0 ? <EmptyState title="No projects assigned" description="Projects this employee is part of will appear here." /> : empProjects.map((p) => (
              <Card key={p.id} className="cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.code} · {p.manager === id ? 'Project Manager' : 'Team Member'}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3"><ProgressBar value={p.progress} color="auto" showLabel /></div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'timesheets' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <KPICard label="Total Hours Logged" value={`${totalHours}h`} icon={Clock3} accent="brand" trend="neutral" />
              <KPICard label="Billable Hours" value={`${billableHours}h`} icon={Clock3} accent="success" trend="neutral" />
            </div>
            <Card padded={false}>
              {empTimesheets.length === 0 ? <EmptyState title="No timesheet entries" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-ink-muted">
                        <th className="px-4 py-2.5 font-medium">Date</th>
                        <th className="px-4 py-2.5 font-medium">Task</th>
                        <th className="px-4 py-2.5 font-medium">Hours</th>
                        <th className="px-4 py-2.5 font-medium">Billable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empTimesheets.map((t) => (
                        <tr key={t.id} className="border-b border-border-subtle last:border-0">
                          <td className="px-4 py-2.5 text-ink">{formatDate(t.date)}</td>
                          <td className="px-4 py-2.5 text-ink-muted">{t.task}</td>
                          <td className="px-4 py-2.5 text-ink">{t.hours}h</td>
                          <td className="px-4 py-2.5"><Badge color={t.billable ? 'success' : 'neutral'}>{t.billable ? 'Yes' : 'No'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === 'performance' && (
          <Card>
            <CardHeader title="Team Utilization & Contribution" subtitle="Derived from active project assignments and logged hours" />
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div><p className="text-xs text-ink-faint">Projects Assigned</p><p className="mt-0.5 text-lg font-semibold text-ink">{empProjects.length}</p></div>
              <div><p className="text-xs text-ink-faint">Hours Logged</p><p className="mt-0.5 text-lg font-semibold text-ink">{totalHours}h</p></div>
              <div><p className="text-xs text-ink-faint">Billable Ratio</p><p className="mt-0.5 text-lg font-semibold text-ink">{totalHours ? Math.round((billableHours / totalHours) * 100) : 0}%</p></div>
            </div>
          </Card>
        )}

        {tab === 'activity' && (
          <Card>{empActivity.length === 0 ? <EmptyState title="No activity yet" description="Actions taken by this employee will appear here." /> : <Timeline items={empActivity} />}</Card>
        )}
      </PageBody>
    </div>
  )
}

function Row({ label, value }) {
  const negative = value < 0
  return (
    <div className="flex items-center justify-between py-2.5">
      <p className="text-ink-muted">{label}</p>
      <p className={negative ? 'font-medium text-red-600' : 'font-medium text-ink'}>{negative ? '-' : ''}{formatCurrency(Math.abs(value))}</p>
    </div>
  )
}

function tenureYears(joiningDate) {
  const start = new Date(joiningDate)
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  const m = now.getMonth() - start.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < start.getDate())) years -= 1
  return Math.max(0, years)
}
