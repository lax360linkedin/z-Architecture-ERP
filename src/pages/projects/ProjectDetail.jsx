import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts'
import {
  ArrowLeft, MapPin, Building2, Calendar, Users2, IndianRupee, Clock3, FileText,
  Download, HardHat, Layers, ListChecks, CalendarClock,
} from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { PageLoader } from '../../components/layout/PageLoader'
import { Card, CardHeader, KPICard, ChartCard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar, AvatarGroup } from '../../components/ui/Avatar'
import { Timeline } from '../../components/ui/Timeline'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { projectApi } from '../../api/projectApi'
import { boqApi } from '../../api/boqApi'
import { taskApi } from '../../api/taskApi'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { getCustomerName } from '../../data/customers'
import { getEmployeeById, getEmployeeName } from '../../data/employees'
import { timesheets as allTimesheets } from '../../data/timesheets'
import { siteReports } from '../../data/site'
import { invoices as allInvoices } from '../../data/invoices'
import { activityFeed } from '../../data/tasks'
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/format'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'planning', label: 'Planning' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'milestones', label: 'Milestones' },
  { value: 'budget', label: 'Budget' },
  { value: 'boq', label: 'BOQ' },
  { value: 'design', label: 'Design' },
  { value: 'drawings', label: 'Drawings' },
  { value: 'documents', label: 'Documents' },
  { value: 'site', label: 'Site' },
  { value: 'timesheets', label: 'Timesheets' },
  { value: 'team', label: 'Team' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'activity', label: 'Activity' },
]

export default function ProjectDetail() {
  const { id, tab } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { canAccessProject, can } = usePermissions()
  const activeTab = tab || 'overview'

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [tasks, setTasks] = useState([])
  const [drawings, setDrawings] = useState([])
  const [designs, setDesigns] = useState([])
  const [documents, setDocuments] = useState([])
  const [boqItems, setBoqItems] = useState([])
  const [budget, setBudget] = useState(null)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function load() {
    setLoading(true)
    const p = await projectApi.get(id)
    if (!p) {
      setProject(null)
      setLoading(false)
      return
    }
    if (!canAccessProject(p)) {
      navigate('/unauthorized', { state: { from: `/projects/${id}` }, replace: true })
      return
    }
    const [ms, tks, drw, dsn, docs, boq, bud] = await Promise.all([
      projectApi.milestonesFor(id),
      projectApi.tasksFor(id),
      projectApi.drawingsFor(id),
      projectApi.designsFor(id),
      projectApi.documentsFor(id),
      boqApi.itemsFor(id),
      boqApi.budgetFor(id),
    ])
    setProject(p)
    setMilestones(ms)
    setTasks(tks)
    setDrawings(drw)
    setDesigns(dsn)
    setDocuments(docs)
    setBoqItems(boq)
    setBudget(bud)
    setLoading(false)
  }

  const projectTimesheets = useMemo(() => allTimesheets.filter((t) => t.project === id), [id])
  const totalHours = useMemo(() => projectTimesheets.reduce((s, t) => s + t.hours, 0), [projectTimesheets])
  const projectSiteReports = useMemo(() => siteReports.filter((s) => s.project === id).sort((a, b) => new Date(b.date) - new Date(a.date)), [id])
  const projectInvoices = useMemo(() => allInvoices.filter((i) => i.project === id), [id])
  const projectPayments = useMemo(() => projectInvoices.filter((i) => i.paid > 0), [projectInvoices])
  const team = useMemo(() => (project?.team || []).map(getEmployeeById).filter(Boolean), [project])
  const phases = useMemo(() => [...new Set(tasks.map((t) => t.phase))], [tasks])
  const expenseByCategory = useMemo(() => {
    const map = {}
    boqItems.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + boqApi.boqTotal(item)
    })
    return Object.entries(map).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount)
  }, [boqItems])
  const totalExpense = expenseByCategory.reduce((s, e) => s + e.amount, 0)

  function handleTabChange(next) {
    navigate(`/projects/${id}/${next}`)
  }

  if (loading) return <PageLoader />

  if (!project) {
    return (
      <div>
        <PageHeader title="Project not found" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/projects')}>Back</Button>} />
        <PageBody><EmptyState title="This project doesn't exist" description="It may have been removed." /></PageBody>
      </div>
    )
  }

  const daysRemaining = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
  const variance = project.actual - project.budget
  const variancePct = project.budget ? (variance / project.budget) * 100 : 0

  return (
    <div>
      <PageHeader
        title={
          <button onClick={() => navigate('/projects')} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Projects
          </button>
        }
        subtitle={null}
        className="pb-0"
      />
      <div className="border-b border-border bg-surface-raised px-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{project.name}</h1>
              <Badge color="brand">{project.code}</Badge>
              <StatusBadge status={project.status} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{getCustomerName(project.client)}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{project.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(project.startDate)} – {formatDate(project.deadline)}</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-64">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Budget vs Actual</span>
              <span className="font-medium text-ink">{formatCurrency(project.budget, { compact: true })} / {formatCurrency(project.actual, { compact: true })}</span>
            </div>
            <ProgressBar value={project.progress} color="auto" showLabel />
          </div>
        </div>
        <Tabs tabs={TABS} value={activeTab} onChange={handleTabChange} className="mt-5 -mb-5 border-b-0" />
      </div>

      <PageBody>
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KPICard label="Progress" value={`${project.progress}%`} icon={ListChecks} accent="brand" trend="neutral" delta={project.stage} />
              <KPICard label="Budget Variance" value={formatCurrency(Math.abs(variance), { compact: true })} icon={IndianRupee} accent={variance > 0 ? 'warning' : 'success'} trend={variance > 0 ? 'down' : 'up'} delta={`${variancePct.toFixed(1)}% ${variance > 0 ? 'over' : 'under'}`} />
              <KPICard label="Days Remaining" value={daysRemaining > 0 ? daysRemaining : 'Overdue'} icon={CalendarClock} accent={daysRemaining < 30 ? 'warning' : 'info'} trend="neutral" delta={formatDate(project.deadline)} />
              <KPICard label="Team Size" value={team.length} icon={Users2} accent="info" trend="neutral" delta={`Managed by ${getEmployeeName(project.manager).split(' ')[0]}`} />
            </div>

            <Card>
              <CardHeader title="Description" />
              <p className="text-sm text-ink-muted">{project.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 text-sm sm:grid-cols-4">
                <div><p className="text-xs text-ink-faint">Area</p><p className="mt-0.5 font-medium text-ink">{project.area}</p></div>
                <div><p className="text-xs text-ink-faint">Type</p><p className="mt-0.5 font-medium text-ink">{project.type}</p></div>
                <div><p className="text-xs text-ink-faint">Stage</p><p className="mt-0.5 font-medium text-ink">{project.stage}</p></div>
                <div><p className="text-xs text-ink-faint">Manager</p><p className="mt-0.5 font-medium text-ink">{getEmployeeName(project.manager)}</p></div>
              </div>
            </Card>

            <ChartCard title="Budget vs Actual" subtitle="Approved budget against actual spend to date">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[{ name: 'Budget', value: project.budget }, { name: 'Actual', value: project.actual }]} margin={{ left: -20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#9c9ca8" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                  <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Bar dataKey="value" fill="#6a3aec" radius={[6, 6, 0, 0]} maxBarSize={80} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader title="Project Team" subtitle={`${team.length} members assigned`} />
              {team.length === 0 ? <EmptyState title="No team assigned" /> : <AvatarGroup names={team.map((t) => t.name)} max={8} size="md" />}
            </Card>
            <Card padded={false}>
              <CardHeader title="Phases" subtitle="Derived from planned work breakdown structure" className="px-5 pt-5" />
              {phases.length === 0 ? (
                <div className="px-5 pb-5"><EmptyState title="No phases planned yet" description="Phases will appear once tasks are scheduled." /></div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {phases.map((phase) => {
                    const phaseTasks = tasks.filter((t) => t.phase === phase)
                    const done = phaseTasks.filter((t) => t.status === 'Done').length
                    return (
                      <div key={phase} className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Layers className="h-4 w-4 text-ink-faint" />
                          <div>
                            <p className="text-sm font-medium text-ink">{phase}</p>
                            <p className="text-xs text-ink-faint">{phaseTasks.length} task(s)</p>
                          </div>
                        </div>
                        <ProgressBar value={phaseTasks.length ? (done / phaseTasks.length) * 100 : 0} color="auto" showLabel className="w-32" />
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'tasks' && (
          <Card padded={false}>
            {tasks.length === 0 ? (
              <div className="p-5"><EmptyState title="No tasks for this project" description="Tasks assigned to this project will appear here." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-ink-muted">
                      <th className="px-5 py-2.5 font-medium">Task</th>
                      <th className="px-5 py-2.5 font-medium">Type</th>
                      <th className="px-5 py-2.5 font-medium">Assignee</th>
                      <th className="px-5 py-2.5 font-medium">Priority</th>
                      <th className="px-5 py-2.5 font-medium">Due Date</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-surface-subtle" onClick={() => navigate(`/tasks/${t.id}`)}>
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">{t.title}</p>
                          {!taskApi.isReady(t) && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
                              Blocked by dependency
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-ink-muted">{t.type}</td>
                        <td className="px-5 py-3 text-ink-muted">{getEmployeeName(t.assignedTo)}</td>
                        <td className="px-5 py-3"><StatusBadge status={t.priority} /></td>
                        <td className="px-5 py-3 text-ink-muted">{formatDate(t.dueDate)}</td>
                        <td className="px-5 py-3"><Badge>{t.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'milestones' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {milestones.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3"><EmptyState title="No milestones defined" description="Project milestones will appear here once planned." /></Card>
            ) : milestones.map((m) => (
              <Card key={m.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-ink">{m.name}</p>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-xs text-ink-faint">Due {formatDate(m.dueDate)}</p>
                <ProgressBar value={m.progress} color="auto" showLabel />
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="flex flex-col gap-5">
            {!budget || (budget.estimated === 0 && budget.approved === 0) ? (
              <Card><EmptyState title="No budget data available" description="Budget comparison will appear once estimation is finalized." /></Card>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <KPICard label="Estimated" value={formatCurrency(budget.estimated, { compact: true })} icon={IndianRupee} accent="info" trend="neutral" />
                  <KPICard label="Approved" value={formatCurrency(budget.approved, { compact: true })} icon={IndianRupee} accent="brand" trend="neutral" />
                  <KPICard label="Committed" value={formatCurrency(budget.committed, { compact: true })} icon={IndianRupee} accent="warning" trend="neutral" />
                  <KPICard label="Actual" value={formatCurrency(budget.actual, { compact: true })} icon={IndianRupee} accent={budget.actual > budget.approved ? 'warning' : 'success'} trend={budget.actual > budget.approved ? 'down' : 'up'} delta={budget.actual > budget.approved ? 'Over approved' : 'Within budget'} />
                </div>
                <ChartCard title="Budget Comparison" subtitle="Estimated, approved, committed and actual spend">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={[{ name: 'Estimated', value: budget.estimated }, { name: 'Approved', value: budget.approved }, { name: 'Committed', value: budget.committed }, { name: 'Actual', value: budget.actual }]} margin={{ left: -20, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#9c9ca8" />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                      <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={70}>
                        {['#9b8afb', '#6a3aec', '#4b21b3', budget.actual > budget.approved ? '#f43f5e' : '#10b981'].map((color, i) => (
                          <Cell key={i} fill={color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </>
            )}
          </div>
        )}

        {activeTab === 'boq' && (
          <Card padded={false}>
            {boqItems.length === 0 ? (
              <div className="p-5"><EmptyState title="No BOQ items" description="Bill of Quantities for this project will appear here." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-ink-muted">
                      <th className="px-5 py-2.5 font-medium">Item Code</th>
                      <th className="px-5 py-2.5 font-medium">Description</th>
                      <th className="px-5 py-2.5 font-medium">Category</th>
                      <th className="px-5 py-2.5 font-medium">Unit</th>
                      <th className="px-5 py-2.5 font-medium text-right">Qty</th>
                      <th className="px-5 py-2.5 font-medium text-right">Rate</th>
                      <th className="px-5 py-2.5 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.map((b) => (
                      <tr key={b.id} className="border-b border-border-subtle last:border-0">
                        <td className="px-5 py-3 font-medium text-ink">{b.itemCode}</td>
                        <td className="px-5 py-3 text-ink-muted">{b.description}</td>
                        <td className="px-5 py-3"><Badge>{b.category}</Badge></td>
                        <td className="px-5 py-3 text-ink-muted">{b.unit}</td>
                        <td className="px-5 py-3 text-right text-ink-muted">{b.quantity}</td>
                        <td className="px-5 py-3 text-right text-ink-muted">{formatCurrency(b.rate)}</td>
                        <td className="px-5 py-3 text-right font-medium text-ink">{formatCurrency(boqApi.boqTotal(b), { compact: true })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'design' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designs.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3"><EmptyState title="No design records" description="Design stages for this project will appear here." /></Card>
            ) : designs.map((d) => (
              <Card key={d.id} className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-ink">{d.stage}</p>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-xs text-ink-muted line-clamp-2">{d.notes}</p>
                <div className="flex items-center justify-between border-t border-border-subtle pt-2.5 text-xs text-ink-faint">
                  <span>{getEmployeeName(d.designer)}</span>
                  <Badge>{d.version}</Badge>
                </div>
                <p className="text-xs text-ink-faint">Updated {formatDate(d.updatedDate)}</p>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'drawings' && (
          <Card padded={false}>
            {drawings.length === 0 ? (
              <div className="p-5"><EmptyState title="No drawings" description="Drawing register entries for this project will appear here." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-ink-muted">
                      <th className="px-5 py-2.5 font-medium">Number</th>
                      <th className="px-5 py-2.5 font-medium">Name</th>
                      <th className="px-5 py-2.5 font-medium">Category</th>
                      <th className="px-5 py-2.5 font-medium">Revision</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawings.map((d) => (
                      <tr key={d.id} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-surface-subtle" onClick={() => navigate(`/design/drawings/${d.id}`)}>
                        <td className="px-5 py-3 font-medium text-ink">{d.number}</td>
                        <td className="px-5 py-3 text-ink-muted">{d.name}</td>
                        <td className="px-5 py-3"><Badge>{d.category}</Badge></td>
                        <td className="px-5 py-3 text-ink-muted">{d.revision}</td>
                        <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3"><EmptyState title="No documents" description="Files uploaded for this project will appear here." /></Card>
            ) : documents.map((d) => (
              <Card key={d.id} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950"><FileText className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                  <p className="text-xs text-ink-faint">{d.size} · {formatDate(d.date)}</p>
                </div>
                <Download className="h-4 w-4 shrink-0 text-ink-faint" />
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'site' && (
          <div className="flex flex-col gap-4">
            {projectSiteReports.length === 0 ? (
              <Card><EmptyState icon={HardHat} title="No site reports" description="Daily site reports for this project will appear here." /></Card>
            ) : (
              <>
                <Card>
                  <CardHeader title="Latest Site Report" subtitle={`${formatDate(projectSiteReports[0].date)} · ${projectSiteReports[0].weather}`} />
                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    <div><p className="text-xs text-ink-faint">Site Engineer</p><p className="mt-0.5 font-medium text-ink">{getEmployeeName(projectSiteReports[0].engineer)}</p></div>
                    <div><p className="text-xs text-ink-faint">Labour Count</p><p className="mt-0.5 font-medium text-ink">{projectSiteReports[0].labourCount}</p></div>
                    <div><p className="text-xs text-ink-faint">Photos</p><p className="mt-0.5 font-medium text-ink">{projectSiteReports[0].photos}</p></div>
                    <div><p className="text-xs text-ink-faint">Weather</p><p className="mt-0.5 font-medium text-ink">{projectSiteReports[0].weather}</p></div>
                  </div>
                  <div className="mt-4 space-y-3 border-t border-border-subtle pt-4 text-sm">
                    <div><p className="text-xs font-medium text-ink-faint">Work Completed</p><p className="mt-1 text-ink-muted">{projectSiteReports[0].workCompleted}</p></div>
                    <div><p className="text-xs font-medium text-ink-faint">Materials</p><p className="mt-1 text-ink-muted">{projectSiteReports[0].materials}</p></div>
                    <div><p className="text-xs font-medium text-ink-faint">Issues</p><p className="mt-1 text-ink-muted">{projectSiteReports[0].issues}</p></div>
                  </div>
                </Card>
                {projectSiteReports.length > 1 && (
                  <Card padded={false}>
                    <CardHeader title="Report History" className="px-5 pt-5" />
                    <div className="divide-y divide-border-subtle">
                      {projectSiteReports.slice(1).map((r) => (
                        <div key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                          <span className="text-ink">{formatDate(r.date)}</span>
                          <span className="text-ink-muted">{r.labourCount} labour · {r.photos} photos</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'timesheets' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <KPICard label="Total Hours Logged" value={totalHours} icon={Clock3} accent="brand" trend="neutral" />
              <KPICard label="Billable Hours" value={projectTimesheets.filter((t) => t.billable).reduce((s, t) => s + t.hours, 0)} icon={IndianRupee} accent="success" trend="neutral" />
              <KPICard label="Entries" value={projectTimesheets.length} icon={ListChecks} accent="info" trend="neutral" />
            </div>
            <Card padded={false}>
              {projectTimesheets.length === 0 ? (
                <div className="p-5"><EmptyState title="No timesheet entries" description="Logged hours for this project will appear here." /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-ink-muted">
                        <th className="px-5 py-2.5 font-medium">Employee</th>
                        <th className="px-5 py-2.5 font-medium">Task</th>
                        <th className="px-5 py-2.5 font-medium">Date</th>
                        <th className="px-5 py-2.5 font-medium text-right">Hours</th>
                        <th className="px-5 py-2.5 font-medium">Billable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectTimesheets.map((t) => (
                        <tr key={t.id} className="border-b border-border-subtle last:border-0">
                          <td className="px-5 py-3 font-medium text-ink">{getEmployeeName(t.employee)}</td>
                          <td className="px-5 py-3 text-ink-muted">{t.task}</td>
                          <td className="px-5 py-3 text-ink-muted">{formatDate(t.date)}</td>
                          <td className="px-5 py-3 text-right text-ink-muted">{t.hours}h</td>
                          <td className="px-5 py-3">{t.billable ? <Badge color="success">Billable</Badge> : <Badge>Internal</Badge>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3"><EmptyState title="No team members assigned" /></Card>
            ) : team.map((e) => (
              <Card key={e.id} className="flex items-center gap-3">
                <Avatar name={e.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{e.name}</p>
                  <p className="truncate text-xs text-ink-faint">{e.designation}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{e.department}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'expenses' && (
          <Card padded={false}>
            {expenseByCategory.length === 0 ? (
              <div className="p-5"><EmptyState title="No expense data" description="Cost breakdown derived from BOQ items will appear here." /></div>
            ) : (
              <div className="flex flex-col divide-y divide-border-subtle p-5">
                {expenseByCategory.map((e) => (
                  <div key={e.category} className="flex flex-col gap-1.5 py-3 first:pt-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{e.category}</span>
                      <span className="text-ink-muted">{formatCurrency(e.amount, { compact: true })} · {totalExpense ? ((e.amount / totalExpense) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <ProgressBar value={totalExpense ? (e.amount / totalExpense) * 100 : 0} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'invoices' && (
          <Card padded={false}>
            {projectInvoices.length === 0 ? (
              <div className="p-5"><EmptyState title="No invoices yet" /></div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {projectInvoices.map((i) => (
                  <div key={i.id} className="flex cursor-pointer items-center justify-between p-4 hover:bg-surface-subtle" onClick={() => navigate(`/billing/invoices/${i.id}`)}>
                    <div>
                      <p className="text-sm font-medium text-ink">{i.id}</p>
                      <p className="text-xs text-ink-faint">Due {formatDate(i.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{formatCurrency(i.amount, { compact: true })}</p>
                      <StatusBadge status={i.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'payments' && (
          <Card padded={false}>
            {projectPayments.length === 0 ? (
              <div className="p-5"><EmptyState title="No payments recorded" /></div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {projectPayments.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-ink">Payment for {i.id}</p>
                      <p className="text-xs text-ink-faint">{formatDate(i.date)}</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(i.paid, { compact: true })}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            {activityFeed.length === 0 ? (
              <EmptyState title="No activity yet" />
            ) : (
              <Timeline
                items={activityFeed}
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
        )}
      </PageBody>
    </div>
  )
}
