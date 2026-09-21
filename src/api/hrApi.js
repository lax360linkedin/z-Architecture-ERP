import { createCrudApi } from './createCrudApi'
import { mockGet, mockMutate } from './mockClient'
import { employees } from '../data/employees'
import { leaveRequests, leaveBalances, holidays, attendanceRecords, salaryStructures, payrollRuns, jobOpenings, candidates, recruitmentStages } from '../data/hr'

const employeesApi = createCrudApi({ store: employees, idPrefix: 'EMP', searchFields: ['name', 'designation', 'email'] })
const jobsApi = createCrudApi({ store: jobOpenings, idPrefix: 'JOB', searchFields: ['title', 'department'] })
const candidatesApi = createCrudApi({ store: candidates, idPrefix: 'CAND', searchFields: ['name', 'email'] })

export const hrApi = {
  employees: employeesApi,
  jobs: jobsApi,
  candidates: candidatesApi,
  recruitmentStages,
  async leaveRequests() {
    return mockGet(leaveRequests)
  },
  async leaveBalanceFor(employeeId) {
    return mockGet(leaveBalances[employeeId] || { 'Casual Leave': 12, 'Sick Leave': 8, 'Earned Leave': 15 })
  },
  async holidays() {
    return mockGet(holidays)
  },
  async approveLeave(id, approve) {
    return mockMutate(() => {
      const req = leaveRequests.find((r) => r.id === id)
      if (req) req.status = approve ? 'approved' : 'rejected'
      return req
    })
  },
  async attendanceToday() {
    return mockGet(attendanceRecords)
  },
  async salaryStructures() {
    return mockGet(salaryStructures)
  },
  async payrollRuns() {
    return mockGet(payrollRuns)
  },
}
