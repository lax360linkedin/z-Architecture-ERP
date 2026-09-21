import { mockGet } from './mockClient'
import { meetings } from '../data/meetings'
import { siteVisits } from '../data/site'
import { milestones } from '../data/tasks'
import { candidates } from '../data/hr'
import { invoices } from '../data/invoices'
import { taskApi } from './taskApi'
import { getProjectName } from '../data/projects'

export const calendarApi = {
  async events() {
    const events = []
    meetings.forEach((m) => events.push({ id: `evt-mtg-${m.id}`, type: 'Meeting', title: m.title, date: m.date, meta: m.time }))
    siteVisits.forEach((v) => events.push({ id: `evt-visit-${v.id}`, type: 'Site Visit', title: v.purpose, date: v.date, meta: v.project }))
    milestones.forEach((m) => events.push({ id: `evt-ms-${m.id}`, type: 'Milestone', title: m.name, date: m.dueDate, meta: m.project }))
    candidates.filter((c) => c.stage === 'Interview').forEach((c) => events.push({ id: `evt-int-${c.id}`, type: 'Interview', title: `Interview - ${c.name}`, date: '2024-09-24', meta: c.job }))
    invoices.filter((i) => i.status !== 'paid').forEach((i) => events.push({ id: `evt-pay-${i.id}`, type: 'Payment', title: `Payment due - ${i.id}`, date: i.dueDate, meta: i.client }))
    const tasks = await taskApi.all()
    tasks.filter((t) => t.dueDate).forEach((t) => events.push({ id: `evt-tsk-${t.id}`, type: 'Task', title: t.title, date: t.dueDate, meta: t.project ? getProjectName(t.project) : t.assignedDepartment || 'General' }))
    return mockGet(events)
  },
}
