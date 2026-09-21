import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Download, FileBarChart2, SearchX } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { taskApi } from '../../api/taskApi'
import { TASK_STATUSES, TASK_PRIORITIES } from '../../data/tasks'
import { useAuth } from '../../context/AuthContext'
import { employees, getEmployeeName } from '../../data/employees'
import { projects, getProjectName } from '../../data/projects'
import { formatDate, classNames } from '../../utils/format'

const COMPLETED_LIKE = ['Completed', 'Approved']

const DATE_RANGES = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'qtr', label: 'This Quarter' },
  { value: 'fy', label: 'This Financial Year' },
]

const DEPARTMENTS = [...new Set(employees.map((e) => e.department))].sort()

const REPORT_CATEGORIES = [
  {
    id: 'team', label: 'Team & Department', reports: [
      { id: 'employee', label: 'Employee Task Report' },
      { id: 'department', label: 'Department Task Report' },
      { id: 'productivity', label: 'Productivity Report' },
    ],
  },
  {
    id: 'project', label: 'Project & Completion', reports: [
      { id: 'project', label: 'Project Task Report' },
      { id: 'completed', label: 'Completed Task Report' },
      { id: 'completion-rate', label: 'Task Completion Report' },
    ],
  },
  {
    id: 'status', label: 'Status & Aging', reports: [
      { id: 'overdue', label: 'Overdue Task Report' },
      { id: 'aging', label: 'Task Aging Report' },
      { id: 'priority', label: 'Task Priority Report' },
    ],
  },
]

function employeeReport(scoped) {
  const ids = [...new Set(scoped.map((t) => t.assignedTo).filter(Boolean))]
  const rows = ids
    .map((id) => {
      const mine = scoped.filter((t) => t.assignedTo === id)
      const counts = TASK_STATUSES.map((s) => mine.filter((t) => t.status === s).length)
      return [getEmployeeName(id), ...counts, mine.length]
    })
    .sort((a, b) => b[b.length - 1] - a[a.length - 1])
  return { columns: ['Employee', ...TASK_STATUSES, 'Total'], rows, summary: `${ids.length} employee(s) with assigned tasks — ${scoped.length} task(s) total` }
}

function departmentReport(scoped) {
  const depts = [...new Set(scoped.map((t) => t.assignedDepartment || 'Unassigned'))]
  const rows = depts
    .map((dept) => {
      const mine = scoped.filter((t) => (t.assignedDepartment || 'Unassigned') === dept)
      const completed = mine.filter((t) => COMPLETED_LIKE.includes(t.status)).length
      const inProgress = mine.filter((t) => t.status === 'In Progress').length
      const overdue = mine.filter(taskApi.isOverdue).length
      return [dept, mine.length, completed, inProgress, overdue]
    })
    .sort((a, b) => b[1] - a[1])
  return { columns: ['Department', 'Total', 'Completed', 'In Progress', 'Overdue'], rows, summary: `${depts.length} department(s)` }
}

function productivityReport(scoped) {
  const ids = [...new Set(scoped.map((t) => t.assignedTo).filter(Boolean))]
  const rows = ids
    .map((id) => {
      const mine = scoped.filter((t) => t.assignedTo === id)
      const est = mine.reduce((s, t) => s + (t.estimatedHours || 0), 0)
      const act = mine.reduce((s, t) => s + (t.actualHours || 0), 0)
      return [getEmployeeName(id), mine.length, est, act, Math.round((act - est) * 100) / 100]
    })
    .sort((a, b) => b[3] - a[3])
  return { columns: ['Employee', 'Tasks', 'Estimated Hours', 'Actual Hours', 'Variance (h)'], rows, summary: `${ids.length} employee(s) with logged or estimated effort` }
}

function projectReport(scoped) {
  const ids = [...new Set(scoped.map((t) => t.project).filter(Boolean))]
  const rows = ids
    .map((id) => {
      const mine = scoped.filter((t) => t.project === id)
      const completed = mine.filter((t) => COMPLETED_LIKE.includes(t.status)).length
      const overdue = mine.filter(taskApi.isOverdue).length
      return [getProjectName(id), mine.length, completed, overdue, mine.length ? `${Math.round((completed / mine.length) * 100)}%` : '0%']
    })
    .sort((a, b) => b[1] - a[1])
  return { columns: ['Project', 'Total', 'Completed', 'Overdue', 'Completion %'], rows, summary: `${ids.length} project(s) with tasks` }
}

function completedReport(scoped) {
  const done = scoped.filter((t) => COMPLETED_LIKE.includes(t.status))
  const rows = done.map((t) => [
    t.title, t.project ? getProjectName(t.project) : 'General', getEmployeeName(t.assignedTo),
    t.priority, formatDate(t.dueDate), t.approvalStatus || '—', t.actualHours ?? 0,
  ])
  return { columns: ['Task', 'Project', 'Assignee', 'Priority', 'Due Date', 'Approval', 'Actual Hours'], rows, summary: `${done.length} completed task(s)` }
}

function overdueReport(scoped) {
  const overdue = scoped.filter(taskApi.isOverdue)
  const today = new Date(new Date().toDateString())
  const rows = overdue
    .map((t) => [
      t.title, t.project ? getProjectName(t.project) : 'General', getEmployeeName(t.assignedTo),
      formatDate(t.dueDate), Math.round((today - new Date(t.dueDate)) / 86400000), t.priority,
    ])
    .sort((a, b) => b[4] - a[4])
  return { columns: ['Task', 'Project', 'Assignee', 'Due Date', 'Days Overdue', 'Priority'], rows, summary: `${overdue.length} overdue task(s)` }
}

function agingReport(scoped) {
  const open = scoped.filter((t) => !['Completed', 'Approved', 'Cancelled'].includes(t.status))
  const today = new Date(new Date().toDateString())
  const rows = open
    .map((t) => [
      t.title, t.project ? getProjectName(t.project) : 'General', getEmployeeName(t.assignedTo),
      formatDate(t.createdDate), Math.max(0, Math.round((today - new Date(t.createdDate)) / 86400000)), t.status,
    ])
    .sort((a, b) => b[4] - a[4])
  return { columns: ['Task', 'Project', 'Assignee', 'Created Date', 'Days Open', 'Status'], rows, summary: `${open.length} open task(s), sorted oldest first` }
}

function priorityReport(scoped) {
  const rows = TASK_PRIORITIES.map((p) => {
    const mine = scoped.filter((t) => t.priority === p)
    const completed = mine.filter((t) => COMPLETED_LIKE.includes(t.status)).length
    const pct = scoped.length ? Math.round((mine.length / scoped.length) * 100) : 0
    return [p, mine.length, completed, mine.length - completed, `${pct}%`]
  })
  return { columns: ['Priority', 'Total', 'Completed', 'Open', '% of All Tasks'], rows, summary: `${scoped.length} task(s) total` }
}

function completionReport(scoped) {
  const ids = [...new Set(scoped.map((t) => t.project).filter(Boolean))]
  const rows = ids
    .map((id) => {
      const mine = scoped.filter((t) => t.project === id)
      const completed = mine.filter((t) => COMPLETED_LIKE.includes(t.status)).length
      const rate = mine.length ? Math.round((completed / mine.length) * 100) : 0
      return [getProjectName(id), mine.length, completed, `${rate}%`]
    })
    .sort((a, b) => b[1] - a[1])
  const totalCompleted = scoped.filter((t) => COMPLETED_LIKE.includes(t.status)).length
  const overallRate = scoped.length ? Math.round((totalCompleted / scoped.length) * 100) : 0
  return { columns: ['Project', 'Total Tasks', 'Completed', 'Completion Rate'], rows, summary: `Overall completion rate: ${overallRate}% (${totalCompleted}/${scoped.length})` }
}

const REPORT_FN = {
  employee: employeeReport,
  department: departmentReport,
  productivity: productivityReport,
  project: projectReport,
  completed: completedReport,
  'completion-rate': completionReport,
  overdue: overdueReport,
  aging: agingReport,
  priority: priorityReport,
}

export default function TaskReports() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [activeCategory, setActiveCategory] = useState(REPORT_CATEGORIES[0])
  const [activeReport, setActiveReport] = useState(REPORT_CATEGORIES[0].reports[0])
  const [query, setQuery] = useState('')
  const [range, setRange] = useState('30d')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  useEffect(() => {
    taskApi.allForUser(user).then((all) => {
      setTasks(all)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const scoped = useMemo(() => tasks
    .filter((t) => employeeFilter === 'all' || t.assignedTo === employeeFilter)
    .filter((t) => projectFilter === 'all' || t.project === projectFilter)
    .filter((t) => departmentFilter === 'all' || t.assignedDepartment === departmentFilter)
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter),
  [tasks, employeeFilter, projectFilter, departmentFilter, statusFilter, priorityFilter])

  const result = useMemo(() => (REPORT_FN[activeReport.id] ? REPORT_FN[activeReport.id](scoped) : { columns: [], rows: [], summary: '' }), [activeReport, scoped])

  const filteredRows = useMemo(() => {
    if (!query) return result.rows
    const q = query.toLowerCase()
    return result.rows.filter((row) => row.some((cell) => String(cell).toLowerCase().includes(q)))
  }, [result, query])

  function selectReport(category, report) {
    setActiveCategory(category)
    setActiveReport(report)
    setQuery('')
  }

  function handleExport() {
    toast.success(`${activeReport.label} exported`)
  }

  return (
    <div>
      <PageHeader title="Task Reports" subtitle="Task performance, productivity and aging analytics" />
      <PageBody className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Card padded={false} className="w-full shrink-0 lg:w-64">
          <div className="max-h-[75vh] overflow-y-auto p-3">
            {REPORT_CATEGORIES.map((category) => (
              <div key={category.id} className="mb-3 last:mb-0">
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">{category.label}</p>
                <div className="flex flex-col gap-0.5">
                  {category.reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => selectReport(category, report)}
                      className={classNames(
                        'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors',
                        activeReport.id === report.id
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                          : 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
                      )}
                    >
                      <FileBarChart2 className="h-3.5 w-3.5 shrink-0" />
                      {report.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card padded={false}>
            <CardHeader
              className="px-5 pt-5"
              title={activeReport.label}
              subtitle={`${activeCategory.label} · ${filteredRows.length} row${filteredRows.length === 1 ? '' : 's'}`}
              action={
                <Button size="sm" variant="secondary" icon={Download} onClick={handleExport}>
                  Export
                </Button>
              }
            />
            <div className="flex flex-wrap items-center gap-2 border-y border-border px-5 py-3">
              <SearchInput value={query} onChange={setQuery} placeholder="Search this report…" className="w-full max-w-xs" />
              <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-auto min-w-[150px]">
                {DATE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
              <Select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="w-auto min-w-[160px]">
                <option value="all">All Employees</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
              <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-auto min-w-[160px]">
                <option value="all">All Projects</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
              <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="w-auto min-w-[160px]">
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[150px]">
                <option value="all">All Status</option>
                {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-auto min-w-[140px]">
                <option value="all">All Priority</option>
                {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>

            {result.summary && (
              <div className="mx-5 mt-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
                {result.summary}
              </div>
            )}

            <div className="p-5">
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : filteredRows.length === 0 ? (
                <EmptyState icon={SearchX} title="No results" description="No rows match this report or your search filter." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-ink-muted">
                        {result.columns.map((col) => (
                          <th key={col} className="whitespace-nowrap px-3 py-2.5 font-medium">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, i) => (
                        <tr key={i} className="border-b border-border-subtle last:border-0 hover:bg-surface-subtle">
                          {row.map((cell, j) => (
                            <td key={j} className="whitespace-nowrap px-3 py-2.5 text-ink">{String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </PageBody>
    </div>
  )
}
