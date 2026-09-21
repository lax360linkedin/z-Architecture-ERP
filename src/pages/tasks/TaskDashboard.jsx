import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  ListChecks, User, Users2, Clock3, Loader2, CheckCircle2, AlertTriangle, CalendarClock,
  CalendarDays, Flame, Ban, UserX, Plus,
} from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard, ChartCard } from '../../components/ui/Card'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { taskApi } from '../../api/taskApi'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { getEmployeeName } from '../../data/employees'
import { getProjectName } from '../../data/projects'
import { formatDate } from '../../utils/format'

const STATUS_COLORS = { 'Not Started': '#9b8afb', 'In Progress': '#6a3aec', Review: '#f59e0b', Approved: '#0ea5e9', Completed: '#10b981', 'On Hold': '#a1a1aa', Blocked: '#f43f5e', Cancelled: '#71717a' }
const PRIORITY_COLORS = { Low: '#9ca3af', Medium: '#6a3aec', High: '#f59e0b', Critical: '#f43f5e' }

export default function TaskDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { can } = usePermissions()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [byStatus, setByStatus] = useState([])
  const [byPriority, setByPriority] = useState([])
  const [byEmployee, setByEmployee] = useState([])
  const [byProject, setByProject] = useState([])
  const [byDepartment, setByDepartment] = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])
  const [criticalTasks, setCriticalTasks] = useState([])

  useEffect(() => {
    Promise.all([
      taskApi.statsFor(user),
      taskApi.byStatus(user),
      taskApi.byPriority(user),
      taskApi.byEmployee(user),
      taskApi.byProject(user),
      taskApi.byDepartment(user),
      taskApi.allForUser(user),
    ]).then(([s, status, priority, emp, proj, dept, all]) => {
      setStats(s)
      setByStatus(status)
      setByPriority(priority)
      setByEmployee(emp)
      setByProject(proj)
      setByDepartment(dept)
      setOverdueTasks(all.filter((t) => taskApi.isOverdue(t)).slice(0, 6))
      setCriticalTasks(all.filter((t) => t.priority === 'Critical' && t.status !== 'Completed').slice(0, 6))
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const completedVsPending = stats ? [
    { name: 'Completed', value: stats.completed },
    { name: 'Pending', value: stats.total - stats.completed },
  ] : []

  return (
    <div>
      <PageHeader
        title="Task Dashboard"
        subtitle="Company-wide work tracking across every ERP module"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => navigate('/tasks/kanban')}>Kanban Board</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/tasks/list')}>All Tasks</Button>
            {can('tasks', 'create') && <Button size="sm" icon={Plus} onClick={() => navigate('/tasks/list?new=1')}>New Task</Button>}
          </>
        }
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {loading || !stats ? (
            Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Tasks" value={stats.total} icon={ListChecks} accent="brand" trend="neutral" />
              <KPICard label="My Tasks" value={stats.myTasks} icon={User} accent="info" trend="neutral" />
              <KPICard label="Assigned by Me" value={stats.assignedByMe} icon={Users2} accent="info" trend="neutral" />
              <KPICard label="Pending" value={stats.pending} icon={Clock3} accent="warning" trend="neutral" />
              <KPICard label="In Progress" value={stats.inProgress} icon={Loader2} accent="brand" trend="neutral" />
              <KPICard label="Completed" value={stats.completed} icon={CheckCircle2} accent="success" trend="up" />
              <KPICard label="Overdue" value={stats.overdue} icon={AlertTriangle} accent="warning" trend={stats.overdue > 0 ? 'down' : 'neutral'} />
              <KPICard label="Due Today" value={stats.dueToday} icon={CalendarClock} accent="info" trend="neutral" />
              <KPICard label="Due This Week" value={stats.dueThisWeek} icon={CalendarDays} accent="info" trend="neutral" />
              <KPICard label="High Priority" value={stats.highPriority} icon={Flame} accent="warning" trend="neutral" />
              <KPICard label="Blocked" value={stats.blocked} icon={Ban} accent="warning" trend="neutral" />
              <KPICard label="Unassigned" value={stats.unassigned} icon={UserX} accent="info" trend="neutral" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard title="Tasks by Status" subtitle="Current distribution across the lifecycle" className="xl:col-span-2">
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byStatus} margin={{ left: -20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-15} textAnchor="end" height={55} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" width={30} allowDecimals={false} />
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]} maxBarSize={44}>
                    {byStatus.map((s, i) => <Cell key={i} fill={STATUS_COLORS[s.status] || '#9b8afb'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ChartCard title="Completed vs Pending" subtitle="Overall completion">
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={completedVsPending} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3}>
                    <Cell fill="#10b981" />
                    <Cell fill="#e4e4eb" />
                  </Pie>
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard title="Tasks by Priority">
            {loading ? <Skeleton className="h-56 w-full" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={byPriority} dataKey="count" nameKey="priority" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {byPriority.map((p, i) => <Cell key={i} fill={PRIORITY_COLORS[p.priority]} />)}
                  </Pie>
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ChartCard title="Tasks by Employee" subtitle="Top assignees">
            {loading ? <Skeleton className="h-56 w-full" /> : byEmployee.length === 0 ? <EmptyState title="No assigned tasks" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byEmployee} layout="vertical" margin={{ left: 8, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" width={90} />
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Bar dataKey="count" name="Tasks" fill="#6a3aec" radius={[0, 6, 6, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ChartCard title="Department-wise Tasks">
            {loading ? <Skeleton className="h-56 w-full" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byDepartment} margin={{ left: -20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="department" fontSize={10} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" width={30} allowDecimals={false} />
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Bar dataKey="count" name="Tasks" fill="#9b8afb" radius={[6, 6, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Tasks by Project">
          {loading ? <Skeleton className="h-56 w-full" /> : byProject.length === 0 ? <EmptyState title="No project tasks" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byProject} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" width={30} allowDecimals={false} />
                <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Bar dataKey="count" name="Tasks" fill="#4b21b3" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card padded={false}>
            <CardHeader title="Overdue Tasks" subtitle={`${overdueTasks.length} task(s) past due`} className="px-5 pt-5" />
            {overdueTasks.length === 0 ? (
              <div className="px-5 pb-5"><EmptyState title="Nothing overdue" description="Every task is on schedule." /></div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {overdueTasks.map((t) => (
                  <button key={t.id} onClick={() => navigate(`/tasks/${t.id}`)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm hover:bg-surface-subtle">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{t.title}</p>
                      <p className="text-xs text-ink-faint">{t.project ? getProjectName(t.project) : 'General'} · {getEmployeeName(t.assignedTo)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge color="danger">{formatDate(t.dueDate)}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card padded={false}>
            <CardHeader title="Critical Priority Tasks" subtitle={`${criticalTasks.length} task(s) need urgent attention`} className="px-5 pt-5" />
            {criticalTasks.length === 0 ? (
              <div className="px-5 pb-5"><EmptyState title="No critical tasks open" /></div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {criticalTasks.map((t) => (
                  <button key={t.id} onClick={() => navigate(`/tasks/${t.id}`)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm hover:bg-surface-subtle">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={getEmployeeName(t.assignedTo)} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{t.title}</p>
                        <p className="text-xs text-ink-faint">{t.project ? getProjectName(t.project) : 'General'}</p>
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </PageBody>
    </div>
  )
}
