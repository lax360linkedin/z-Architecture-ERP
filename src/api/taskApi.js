import { mockGet, mockMutate, nextId, paginate, searchItems, sortItems } from './mockClient'
import { tasks, milestones, TASK_STATUSES } from '../data/tasks'
import { timesheets } from '../data/timesheets'
import { logAudit } from './auditLogApi'
import { notifyUser } from './notificationsApi'
import { canAccessTask, GLOBAL_TASK_ROLES } from '../utils/permissions'
import { getEmployeeName } from '../data/employees'
import { getProjectName } from '../data/projects'

const COMPLETED_LIKE = ['Completed', 'Approved']

function scopedTasks(user) {
  if (!user) return []
  if (GLOBAL_TASK_ROLES.includes(user.roleId)) return tasks
  return tasks.filter((t) => canAccessTask(user, t))
}

function isOverdue(t) {
  if (!t.dueDate || COMPLETED_LIKE.includes(t.status) || t.status === 'Cancelled') return false
  return new Date(t.dueDate) < new Date(new Date().toDateString())
}

function isDueToday(t) {
  if (!t.dueDate) return false
  return new Date(t.dueDate).toDateString() === new Date().toDateString()
}

function isDueThisWeek(t) {
  if (!t.dueDate) return false
  const due = new Date(t.dueDate)
  const now = new Date()
  const in7 = new Date(now)
  in7.setDate(now.getDate() + 7)
  return due >= now && due <= in7
}

// A task with a Finish-to-Start dependency isn't ready to start until every
// FS-dependency has reached a completed-like state — used to flag "blocked
// by dependency" in the UI even when the task's own status isn't literally
// "Blocked".
export function isTaskReady(t) {
  if (!t.dependencies?.length) return true
  return t.dependencies
    .filter((d) => d.type === 'FS')
    .every((d) => {
      const dep = tasks.find((x) => x.id === d.taskId)
      return dep && COMPLETED_LIKE.includes(dep.status)
    })
}

function recordActivity(t, action, userId) {
  t.activity = t.activity || []
  t.activity.unshift({ id: nextId('AC'), action, user: userId, time: new Date().toISOString() })
}

export const taskApi = {
  TASK_STATUSES,

  async listForUser(user, { query = '', page = 1, pageSize = 10, sortBy, sortDir, filters = {} } = {}) {
    let scoped = scopedTasks(user)
    scoped = searchItems(scoped, query, ['title', 'id'])
    Object.entries(filters).forEach(([key, value]) => {
      if (value == null || value === '' || value === 'all') return
      if (key === 'overdue') {
        scoped = scoped.filter(isOverdue)
        return
      }
      scoped = scoped.filter((item) => item[key] === value)
    })
    scoped = sortItems(scoped, sortBy, sortDir)
    return mockGet(paginate(scoped, { page, pageSize }))
  },

  async allForUser(user) {
    return mockGet(scopedTasks(user))
  },

  async all() {
    return mockGet(tasks)
  },

  async get(id) {
    return mockGet(tasks.find((t) => t.id === id) || null)
  },

  async forProject(projectId) {
    return mockGet(tasks.filter((t) => t.project === projectId))
  },

  async forMilestone(milestoneId) {
    return mockGet(tasks.filter((t) => t.milestone === milestoneId))
  },

  async subtasksOf(taskId) {
    return mockGet(tasks.filter((t) => t.parentTask === taskId))
  },

  // Parent-task progress reflects subtask completion, e.g. "4/6 done = 67%".
  async parentProgress(taskId) {
    const subtasks = tasks.filter((t) => t.parentTask === taskId)
    if (subtasks.length === 0) return mockGet(null)
    const done = subtasks.filter((t) => COMPLETED_LIKE.includes(t.status)).length
    return mockGet({ total: subtasks.length, done, percent: Math.round((done / subtasks.length) * 100) })
  },

  async milestoneProgress(milestoneId) {
    const linked = tasks.filter((t) => t.milestone === milestoneId)
    if (linked.length === 0) return mockGet(null)
    const done = linked.filter((t) => COMPLETED_LIKE.includes(t.status)).length
    return mockGet({ total: linked.length, done, percent: Math.round((done / linked.length) * 100) })
  },

  isReady: isTaskReady,

  async create(payload, user) {
    return mockMutate(() => {
      const record = {
        id: nextId('TSK'),
        description: '', milestone: null, parentTask: null, reviewer: null, assignedDepartment: null,
        estimatedHours: 0, actualHours: 0, approvalStatus: null, tags: [], checklist: [], dependencies: [],
        attachments: [], comments: [], activity: [], relatedDrawing: null, relatedPO: null, relatedInvoice: null,
        branchId: user?.branchId || 'BR-01', createdDate: new Date().toISOString().slice(0, 10),
        status: 'Not Started', priority: 'Medium',
        ...payload,
      }
      recordActivity(record, 'created the task', user?.employeeId)
      tasks.unshift(record)
      if (record.assignedTo) {
        notifyUser(record.assignedTo, {
          category: 'Tasks',
          title: `New task assigned: "${record.title}"`,
          priority: record.priority === 'Critical' ? 'high' : 'medium',
          link: `/tasks/${record.id}`,
        })
      }
      logAudit({ user, action: 'Created task', module: 'Tasks', record: record.id, change: record.title })
      return record
    })
  },

  async update(id, patch, user) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      Object.assign(t, patch)
      recordActivity(t, 'updated the task', user?.employeeId)
      logAudit({ user, action: 'Updated task', module: 'Tasks', record: id, change: Object.keys(patch).join(', ') })
      return t
    })
  },

  async remove(id, user) {
    return mockMutate(() => {
      const idx = tasks.findIndex((t) => t.id === id)
      if (idx > -1) tasks.splice(idx, 1)
      logAudit({ user, action: 'Deleted task', module: 'Tasks', record: id })
      return { id }
    })
  },

  async changeStatus(id, status, user) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      const prev = t.status
      t.status = status
      if (COMPLETED_LIKE.includes(status) && t.approvalStatus == null && status === 'Completed') t.approvalStatus = t.approvalStatus || 'approved'
      recordActivity(t, `moved from ${prev} to ${status}`, user?.employeeId)
      logAudit({ user, action: 'Changed task status', module: 'Tasks', record: id, change: `status: ${prev} → ${status}` })
      if (status === 'Review' && t.reviewer) {
        notifyUser(t.reviewer, { category: 'Tasks', title: `"${t.title}" was sent for review`, priority: 'medium', link: `/tasks/${id}` })
      }
      if (status === 'Completed' && t.createdBy) {
        notifyUser(t.createdBy, { category: 'Tasks', title: `"${t.title}" was marked complete`, priority: 'low', link: `/tasks/${id}` })
      }
      return t
    })
  },

  async approve(id, approve, user) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      t.approvalStatus = approve ? 'approved' : 'rejected'
      t.status = approve ? 'Approved' : 'In Progress'
      recordActivity(t, approve ? 'approved the task' : 'rejected the task', user?.employeeId)
      logAudit({ user, action: approve ? 'Approved task' : 'Rejected task', module: 'Tasks', record: id })
      if (t.assignedTo) {
        notifyUser(t.assignedTo, {
          category: 'Tasks',
          title: approve ? `"${t.title}" was approved` : `"${t.title}" was rejected — needs rework`,
          priority: approve ? 'low' : 'high',
          link: `/tasks/${id}`,
        })
      }
      return t
    })
  },

  async reassign(id, newAssigneeId, user) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      const prevAssignee = t.assignedTo
      t.assignedTo = newAssigneeId
      recordActivity(t, `reassigned from ${getEmployeeName(prevAssignee)} to ${getEmployeeName(newAssigneeId)}`, user?.employeeId)
      logAudit({ user, action: 'Reassigned task', module: 'Tasks', record: id, change: `assignedTo: ${prevAssignee || 'unassigned'} → ${newAssigneeId}` })
      notifyUser(newAssigneeId, { category: 'Tasks', title: `Task reassigned to you: "${t.title}"`, priority: t.priority === 'Critical' ? 'high' : 'medium', link: `/tasks/${id}` })
      return t
    })
  },

  async addComment(id, text, user) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      t.comments = t.comments || []
      t.comments.push({ id: nextId('CM'), author: user?.employeeId, text, time: new Date().toISOString() })
      recordActivity(t, 'commented on the task', user?.employeeId)
      if (t.assignedTo && t.assignedTo !== user?.employeeId) {
        notifyUser(t.assignedTo, { category: 'Tasks', title: `New comment on "${t.title}"`, priority: 'low', link: `/tasks/${id}` })
      }
      return t
    })
  },

  async addAttachment(id, file, user) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      t.attachments = t.attachments || []
      t.attachments.push({ id: nextId('AT'), name: file.name, type: (file.name.split('.').pop() || 'file').toUpperCase(), size: `${(file.size / 1024).toFixed(0)} KB`, uploadedBy: user?.employeeId, date: new Date().toISOString().slice(0, 10) })
      recordActivity(t, `uploaded ${file.name}`, user?.employeeId)
      return t
    })
  },

  async toggleChecklistItem(id, itemId, user) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      const item = (t.checklist || []).find((c) => c.id === itemId)
      if (item) item.done = !item.done
      return t
    })
  },

  async addChecklistItem(id, text) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      t.checklist = t.checklist || []
      t.checklist.push({ id: nextId('CL'), text, done: false })
      return t
    })
  },

  async addDependency(id, dependsOnTaskId, type = 'FS') {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      t.dependencies = t.dependencies || []
      if (!t.dependencies.some((d) => d.taskId === dependsOnTaskId)) t.dependencies.push({ taskId: dependsOnTaskId, type })
      return t
    })
  },

  async removeDependency(id, dependsOnTaskId) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === id)
      if (!t) throw new Error('Task not found')
      t.dependencies = (t.dependencies || []).filter((d) => d.taskId !== dependsOnTaskId)
      return t
    })
  },

  // ---- Dashboard aggregates ----
  async statsFor(user) {
    const scoped = scopedTasks(user)
    const stats = {
      total: scoped.length,
      myTasks: scoped.filter((t) => t.assignedTo === user?.employeeId).length,
      assignedByMe: scoped.filter((t) => t.createdBy === user?.employeeId).length,
      pending: scoped.filter((t) => t.status === 'Not Started').length,
      inProgress: scoped.filter((t) => t.status === 'In Progress').length,
      completed: scoped.filter((t) => COMPLETED_LIKE.includes(t.status)).length,
      overdue: scoped.filter(isOverdue).length,
      dueToday: scoped.filter(isDueToday).length,
      dueThisWeek: scoped.filter(isDueThisWeek).length,
      highPriority: scoped.filter((t) => t.priority === 'High' || t.priority === 'Critical').length,
      blocked: scoped.filter((t) => t.status === 'Blocked' || !isTaskReady(t)).length,
      unassigned: scoped.filter((t) => !t.assignedTo).length,
    }
    return mockGet(stats)
  },

  async byStatus(user) {
    const scoped = scopedTasks(user)
    return mockGet(TASK_STATUSES.map((status) => ({ status, count: scoped.filter((t) => t.status === status).length })))
  },

  async byPriority(user) {
    const scoped = scopedTasks(user)
    return mockGet(['Low', 'Medium', 'High', 'Critical'].map((priority) => ({ priority, count: scoped.filter((t) => t.priority === priority).length })))
  },

  async byEmployee(user) {
    const scoped = scopedTasks(user)
    const map = {}
    scoped.forEach((t) => {
      if (!t.assignedTo) return
      map[t.assignedTo] = (map[t.assignedTo] || 0) + 1
    })
    return mockGet(Object.entries(map).map(([employeeId, count]) => ({ employeeId, name: getEmployeeName(employeeId), count })).sort((a, b) => b.count - a.count).slice(0, 8))
  },

  async byProject(user) {
    const scoped = scopedTasks(user)
    const map = {}
    scoped.forEach((t) => {
      if (!t.project) return
      map[t.project] = (map[t.project] || 0) + 1
    })
    return mockGet(Object.entries(map).map(([projectId, count]) => ({ projectId, name: getProjectName(projectId), count })).sort((a, b) => b.count - a.count))
  },

  async byDepartment(user) {
    const scoped = scopedTasks(user)
    const map = {}
    scoped.forEach((t) => {
      const dept = t.assignedDepartment || 'Unassigned'
      map[dept] = (map[dept] || 0) + 1
    })
    return mockGet(Object.entries(map).map(([department, count]) => ({ department, count })))
  },

  isOverdue,
  isDueToday,
  isDueThisWeek,

  // Task ↔ Timesheet integration: logging time against a task creates a
  // timesheet entry AND adds the hours to that task's actualHours, so the
  // same number of hours drives the employee's timesheet, the project
  // timesheet view and (via actualHours) project cost reporting.
  async logTime({ taskId, employeeId, date, hours, billable = true, description = '' }, user) {
    return mockMutate(() => {
      const t = tasks.find((x) => x.id === taskId)
      if (!t) throw new Error('Task not found')
      t.actualHours = Math.round(((t.actualHours || 0) + Number(hours)) * 100) / 100
      const entry = {
        id: nextId('TS'), employee: employeeId, project: t.project, task: t.title, taskId,
        date, hours: Number(hours), billable, description,
      }
      timesheets.unshift(entry)
      recordActivity(t, `logged ${hours}h`, user?.employeeId || employeeId)
      return { entry, task: t }
    })
  },
}

export const milestoneApi = {
  async list() {
    return mockGet(milestones)
  },
  async forProject(projectId) {
    return mockGet(milestones.filter((m) => m.project === projectId))
  },
}
