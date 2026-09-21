import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { IndianRupee, TrendingUp, FolderKanban, Clock3, UserPlus, Users2, CheckCircle2, ListChecks, CalendarClock } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard, ChartCard } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Timeline } from '../../components/ui/Timeline'
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { dashboardApi } from '../../api/dashboardApi'
import { taskApi, timesheetApi, meetingApi } from '../../api/collaborationApi'
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { getEmployeeName } from '../../data/employees'
import { getCustomerName } from '../../data/customers'
import { getProjectName } from '../../data/projects'

const COLORS = ['#6a3aec', '#9b8afb', '#c4b5fd', '#4b21b3']

function useGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { can, isRole } = usePermissions()
  const greeting = useGreeting()

  // Generic Staff/Employee accounts only have visibility into their own
  // work — tasks, timesheets and meetings — so they get a compact personal
  // view instead of the company-wide financial dashboard.
  if (isRole('employee')) {
    return <MyWorkDashboard user={user} greeting={greeting} />
  }

  return <CompanyDashboard user={user} greeting={greeting} can={can} />
}

function MyWorkDashboard({ user, greeting }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [myTasks, setMyTasks] = useState([])
  const [weekHours, setWeekHours] = useState(0)
  const [upcomingMeetings, setUpcomingMeetings] = useState([])

  useEffect(() => {
    Promise.all([taskApi.myTasks.all(), timesheetApi.all(), meetingApi.all()]).then(([allTasks, allTimesheets, allMeetings]) => {
      const mine = user?.employeeId ? allTasks.filter((t) => t.assignee === user.employeeId) : allTasks
      const openTasks = mine.filter((t) => t.status !== 'Done').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      setMyTasks(openTasks)

      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setHours(0, 0, 0, 0)
      startOfWeek.setDate(now.getDate() - now.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
      const hours = allTimesheets
        .filter((t) => (user?.employeeId ? t.employee === user.employeeId : true))
        .filter((t) => {
          const d = new Date(t.date)
          return d >= startOfWeek && d < endOfWeek
        })
        .reduce((s, t) => s + t.hours, 0)
      setWeekHours(hours)

      const today = new Date(now.toDateString())
      const upcoming = allMeetings
        .filter((m) => new Date(m.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
      setUpcomingMeetings(upcoming)

      setLoading(false)
    })
  }, [user])

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || ''}`}
        subtitle={new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>
              View Tasks
            </Button>
            <Button size="sm" onClick={() => navigate('/timesheets')}>
              Log Time
            </Button>
          </>
        }
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Tasks Due" value={myTasks.length} icon={ListChecks} accent="brand" trend="neutral" deltaLabel="open tasks" />
              <KPICard label="Hours Logged" value={`${weekHours}h`} icon={Clock3} accent="info" trend="neutral" deltaLabel="this week" />
              <KPICard label="Upcoming Meetings" value={upcomingMeetings.length} icon={CalendarClock} accent="success" trend="neutral" deltaLabel="on your calendar" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card padded={false}>
            <CardHeader title="My Tasks" subtitle={`${myTasks.length} open task(s)`} className="px-5 pt-5" action={<Button size="sm" variant="ghost" onClick={() => navigate('/tasks')}>View all</Button>} />
            <div className="flex flex-col divide-y divide-border-subtle">
              {loading ? (
                <div className="p-5"><Skeleton className="h-32 w-full" /></div>
              ) : myTasks.length === 0 ? (
                <div className="p-5"><EmptyState title="No open tasks" description="You're all caught up." /></div>
              ) : (
                myTasks.slice(0, 6).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{t.title}</p>
                      <p className="text-xs text-ink-faint">{t.project ? getProjectName(t.project) : 'Internal'} · Due {formatDate(t.dueDate)}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card padded={false}>
            <CardHeader title="Upcoming Meetings" subtitle={`${upcomingMeetings.length} scheduled`} className="px-5 pt-5" action={<Button size="sm" variant="ghost" onClick={() => navigate('/meetings')}>View all</Button>} />
            <div className="flex flex-col divide-y divide-border-subtle">
              {loading ? (
                <div className="p-5"><Skeleton className="h-32 w-full" /></div>
              ) : upcomingMeetings.length === 0 ? (
                <div className="p-5"><EmptyState title="No upcoming meetings" description="Your calendar is clear for now." /></div>
              ) : (
                upcomingMeetings.slice(0, 6).map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{m.title}</p>
                      <p className="text-xs text-ink-faint">{m.project ? getProjectName(m.project) : 'Internal'}</p>
                    </div>
                    <div className="text-right text-xs text-ink-faint">
                      <p className="font-medium text-ink">{formatDate(m.date)}</p>
                      <p>{m.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </PageBody>
    </div>
  )
}

function CompanyDashboard({ user, greeting, can }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState(null)
  const [revenueTrend, setRevenueTrend] = useState([])
  const [cashFlow, setCashFlow] = useState([])
  const [statusDist, setStatusDist] = useState([])
  const [pipeline, setPipeline] = useState([])
  const [performance, setPerformance] = useState([])
  const [receivables, setReceivables] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [approvals, setApprovals] = useState([])
  const [activity, setActivity] = useState([])

  const canFinance = can('finance', 'view')
  const canSales = can('sales', 'view')

  useEffect(() => {
    Promise.all([
      dashboardApi.kpis(),
      dashboardApi.revenueTrend(),
      dashboardApi.cashFlow(),
      dashboardApi.projectStatusDistribution(),
      dashboardApi.salesPipeline(),
      dashboardApi.projectPerformance(),
      dashboardApi.outstandingReceivables(),
      dashboardApi.upcomingDeadlines(),
      dashboardApi.pendingApprovals(),
      dashboardApi.recentActivity(),
    ]).then(([k, rt, cf, sd, sp, pp, rec, dl, ap, act]) => {
      setKpis(k)
      setRevenueTrend(rt)
      setCashFlow(cf)
      setStatusDist(sd)
      setPipeline(sp)
      setPerformance(pp)
      setReceivables(rec)
      setDeadlines(dl)
      setApprovals(ap)
      setActivity(act)
      setLoading(false)
    })
  }, [])

  const showRevenueChart = canFinance
  const showCashFlowChart = canFinance
  const showSalesPipelineChart = canSales
  const showReceivables = canFinance
  const showChartRow2 = showSalesPipelineChart || showCashFlowChart

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || ''}`}
        subtitle={new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => navigate('/reports')}>
              View Reports
            </Button>
            <Button size="sm" onClick={() => navigate('/projects')}>
              New Project
            </Button>
          </>
        }
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {loading || !kpis ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              {canFinance && (
                <>
                  <KPICard label="Total Revenue" value={formatCurrency(kpis.revenue, { compact: true })} icon={IndianRupee} delta="+12.4%" deltaLabel="vs last month" trend="up" accent="brand" />
                  <KPICard label="Net Profit" value={formatCurrency(kpis.netProfit, { compact: true })} icon={TrendingUp} delta="+8.1%" deltaLabel="vs last month" trend="up" accent="success" />
                </>
              )}
              <KPICard label="Active Projects" value={kpis.activeProjects} icon={FolderKanban} delta="2 new" deltaLabel="this month" trend="up" accent="info" />
              {canFinance && (
                <KPICard label="Pending Payments" value={formatCurrency(kpis.pendingPayments, { compact: true })} icon={Clock3} delta="-4.2%" deltaLabel="vs last month" trend="down" accent="warning" />
              )}
              <KPICard label="New Leads" value={kpis.newLeads} icon={UserPlus} delta="+3" deltaLabel="this week" trend="up" accent="brand" />
              <KPICard label="Team Members" value={kpis.teamMembers} icon={Users2} delta="Active" trend="neutral" accent="info" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {showRevenueChart && (
            <ChartCard title="Revenue Analytics" subtitle="Revenue vs expenses, last 6 months" className="xl:col-span-2">
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueTrend} margin={{ left: -20, top: 10 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6a3aec" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="#6a3aec" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-color-border, #e4e4eb)" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                    <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6a3aec" strokeWidth={2.5} fill="url(#rev)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#a78bfa" strokeWidth={2.5} fill="url(#exp)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          )}

          <ChartCard title="Project Overview" subtitle="Status distribution" className={showRevenueChart ? undefined : 'xl:col-span-3'}>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusDist} dataKey="count" nameKey="status" innerRadius={58} outerRadius={90} paddingAngle={3}>
                    {statusDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {showChartRow2 && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {showSalesPipelineChart && (
              <ChartCard title="Sales Pipeline" subtitle="Lead → Opportunity → Proposal → Won" className={showCashFlowChart ? 'xl:col-span-2' : 'xl:col-span-3'}>
                {loading ? (
                  <Skeleton className="h-56 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={pipeline} margin={{ left: -20, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="stage" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-12} textAnchor="end" height={50} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" width={30} />
                      <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} formatter={(v, n) => (n === 'value' ? formatCurrency(v) : v)} />
                      <Bar dataKey="count" name="Deals" fill="#6a3aec" radius={[6, 6, 0, 0]} maxBarSize={38} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            )}
            {showCashFlowChart && (
              <ChartCard title="Cash Flow" subtitle="Inflow vs outflow" className={showSalesPipelineChart ? undefined : 'xl:col-span-3'}>
                {loading ? (
                  <Skeleton className="h-56 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={cashFlow} margin={{ left: -20, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#9c9ca8" />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={60} />
                      <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                      <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="#10b98122" strokeWidth={2} />
                      <Area type="monotone" dataKey="outflow" stroke="#f43f5e" fill="#f43f5e14" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            )}
          </div>
        )}

        <Card padded={false}>
          <CardHeader title="Project Performance" subtitle="Budget, actuals and progress across active projects" className="px-5 pt-5" action={<Button size="sm" variant="ghost" onClick={() => navigate('/projects')}>View all</Button>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-ink-muted">
                  <th className="px-5 py-2.5 font-medium">Project</th>
                  <th className="px-5 py-2.5 font-medium">Client</th>
                  <th className="px-5 py-2.5 font-medium">Manager</th>
                  <th className="px-5 py-2.5 font-medium">Budget</th>
                  <th className="px-5 py-2.5 font-medium">Actual Cost</th>
                  <th className="px-5 py-2.5 font-medium">Progress</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border-subtle">
                        <td className="px-5 py-3" colSpan={7}>
                          <Skeleton className="h-5 w-full" />
                        </td>
                      </tr>
                    ))
                  : performance.map((p) => (
                      <tr key={p.id} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-surface-subtle" onClick={() => navigate(`/projects/${p.id}`)}>
                        <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                        <td className="px-5 py-3 text-ink-muted">{getCustomerName(p.client)}</td>
                        <td className="px-5 py-3 text-ink-muted">{getEmployeeName(p.manager)}</td>
                        <td className="px-5 py-3 text-ink-muted">{formatCurrency(p.budget, { compact: true })}</td>
                        <td className="px-5 py-3 text-ink-muted">{formatCurrency(p.actual, { compact: true })}</td>
                        <td className="px-5 py-3">
                          <ProgressBar value={p.progress} color="auto" showLabel className="w-32" />
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {showReceivables && (
            <Card>
              <CardHeader title="Outstanding Receivables" subtitle={`${receivables.length} invoices pending`} />
              <div className="flex flex-col divide-y divide-border-subtle">
                {loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  receivables.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <p className="font-medium text-ink">{r.id}</p>
                        <p className="text-xs text-ink-faint">{getCustomerName(r.client)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-ink">{formatCurrency(r.amount - r.paid, { compact: true })}</p>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Upcoming Deadlines" subtitle="Milestones due soon" />
            <div className="flex flex-col divide-y divide-border-subtle">
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                deadlines.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-ink">{m.name}</p>
                      <p className="text-xs text-ink-faint">{formatDate(m.dueDate)}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Pending Approvals" subtitle={`${approvals.length} awaiting action`} />
            <div className="flex flex-col gap-2.5">
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                approvals.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <Badge color="warning">{a.type}</Badge>
                      {a.amount && <span className="text-xs font-semibold text-ink">{formatCurrency(a.amount, { compact: true })}</span>}
                    </div>
                    <p className="mt-2 text-sm text-ink">{a.description}</p>
                    <p className="mt-1 text-xs text-ink-faint">Requested by {getEmployeeName(a.requestedBy)}</p>
                    <div className="mt-2.5 flex gap-2">
                      <Button size="sm" variant="secondary" className="flex-1 justify-center" icon={CheckCircle2}>
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="flex-1 justify-center">
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title="Recent Activity" subtitle="Latest updates across your organization" />
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Timeline
              items={activity}
              renderContent={(item) => (
                <p className="text-sm text-ink">
                  <span className="font-medium">{getEmployeeName(item.user)}</span>{' '}
                  <span className="text-ink-muted">{item.action}</span>{' '}
                  <span className="font-medium">{item.target}</span>
                  <span className="ml-2 text-xs text-ink-faint">{formatRelativeTime(item.time)}</span>
                </p>
              )}
            />
          )}
        </Card>
      </PageBody>
    </div>
  )
}
