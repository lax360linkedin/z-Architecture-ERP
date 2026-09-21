import { createCrudApi } from './createCrudApi'
import { mockGet, mockMutate } from './mockClient'
import { myTasks, wbsTasks, activityFeed, taskStatuses } from '../data/tasks'
import { timesheets, timesheetSummary } from '../data/timesheets'
import { meetings } from '../data/meetings'

export const taskApi = {
  myTasks: createCrudApi({ store: myTasks, idPrefix: 'TSK', searchFields: ['title'] }),
  teamTasks: createCrudApi({ store: wbsTasks, idPrefix: 'TSK', searchFields: ['name'] }),
  taskStatuses,
  async moveTask(id, status, isTeam = false) {
    const list = isTeam ? wbsTasks : myTasks
    return mockMutate(() => {
      const t = list.find((x) => x.id === id)
      if (t) t.status = status
      return t
    })
  },
  async activity() {
    return mockGet(activityFeed)
  },
}

export const timesheetApi = {
  ...createCrudApi({ store: timesheets, idPrefix: 'TS', searchFields: ['task', 'description'] }),
  async summary() {
    return mockGet(timesheetSummary(timesheets))
  },
}

export const meetingApi = createCrudApi({ store: meetings, idPrefix: 'MTG', searchFields: ['title', 'location'] })
