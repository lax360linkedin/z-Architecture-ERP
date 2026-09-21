import { createCrudApi } from './createCrudApi'
import { mockGet } from './mockClient'
import { timesheets, timesheetSummary } from '../data/timesheets'
import { meetings } from '../data/meetings'

// Task-related APIs live in src/api/taskApi.js — this file now only covers
// timesheets and meetings.
export const timesheetApi = {
  ...createCrudApi({ store: timesheets, idPrefix: 'TS', searchFields: ['task', 'description'] }),
  async summary() {
    return mockGet(timesheetSummary(timesheets))
  },
  async forTask(taskId) {
    return mockGet(timesheets.filter((t) => t.taskId === taskId))
  },
}

export const meetingApi = createCrudApi({ store: meetings, idPrefix: 'MTG', searchFields: ['title', 'location'] })
