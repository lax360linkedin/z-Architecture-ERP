export const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave']

export const leaveBalances = {
  'EMP-002': { 'Casual Leave': 8, 'Sick Leave': 6, 'Earned Leave': 14 },
  'EMP-004': { 'Casual Leave': 5, 'Sick Leave': 8, 'Earned Leave': 10 },
  'EMP-011': { 'Casual Leave': 10, 'Sick Leave': 7, 'Earned Leave': 12 },
  'EMP-024': { 'Casual Leave': 2, 'Sick Leave': 3, 'Earned Leave': 6 },
}

export const leaveRequests = [
  { id: 'LV-801', employee: 'EMP-024', type: 'Sick Leave', from: '2024-09-16', to: '2024-09-20', days: 5, reason: 'Recovering from minor surgery', status: 'approved', appliedOn: '2024-09-14', approver: 'EMP-016' },
  { id: 'LV-802', employee: 'EMP-010', type: 'Casual Leave', from: '2024-09-23', to: '2024-09-24', days: 2, reason: 'Family function', status: 'pending', appliedOn: '2024-09-17', approver: 'EMP-016' },
  { id: 'LV-803', employee: 'EMP-020', type: 'Earned Leave', from: '2024-10-02', to: '2024-10-08', days: 7, reason: 'Annual family vacation', status: 'pending', appliedOn: '2024-09-18', approver: 'EMP-016' },
  { id: 'LV-804', employee: 'EMP-021', type: 'Casual Leave', from: '2024-09-14', to: '2024-09-14', days: 1, reason: 'Personal work', status: 'rejected', appliedOn: '2024-09-12', approver: 'EMP-016' },
]

export const holidays = [
  { id: 'HOL-1', name: 'Gandhi Jayanti', date: '2024-10-02' },
  { id: 'HOL-2', name: 'Dussehra', date: '2024-10-12' },
  { id: 'HOL-3', name: 'Diwali', date: '2024-11-01' },
  { id: 'HOL-4', name: 'Diwali (Bhai Dooj)', date: '2024-11-03' },
  { id: 'HOL-5', name: 'Christmas', date: '2024-12-25' },
  { id: 'HOL-6', name: 'Republic Day', date: '2025-01-26' },
]

export const attendanceRecords = [
  { employee: 'EMP-002', date: '2024-09-19', checkIn: '09:12', checkOut: '19:05', status: 'present', hours: 9.9, late: false },
  { employee: 'EMP-004', date: '2024-09-19', checkIn: '09:45', checkOut: '18:30', status: 'present', hours: 8.75, late: true },
  { employee: 'EMP-011', date: '2024-09-19', checkIn: '08:30', checkOut: '18:00', status: 'present', hours: 9.5, late: false },
  { employee: 'EMP-009', date: '2024-09-19', checkIn: null, checkOut: null, status: 'absent', hours: 0, late: false },
  { employee: 'EMP-024', date: '2024-09-19', checkIn: null, checkOut: null, status: 'on-leave', hours: 0, late: false },
  { employee: 'EMP-017', date: '2024-09-19', checkIn: '09:20', checkOut: '18:15', status: 'present', hours: 8.9, late: false },
]

export const salaryStructures = [
  { employee: 'EMP-002', basic: 185000, hra: 74000, allowances: 32000, pf: 22200, tax: 41000, netPay: 227800 },
  { employee: 'EMP-004', basic: 145000, hra: 58000, allowances: 24000, pf: 17400, tax: 28500, netPay: 181100 },
  { employee: 'EMP-011', basic: 68000, hra: 27200, allowances: 12000, pf: 8160, tax: 6200, netPay: 92840 },
  { employee: 'EMP-016', basic: 120000, hra: 48000, allowances: 18000, pf: 14400, tax: 19500, netPay: 152100 },
]

export const payrollRuns = [
  { id: 'PAY-2024-08', period: 'August 2024', processedOn: '2024-09-01', employeeCount: 24, totalPaid: 3420000, status: 'processed' },
  { id: 'PAY-2024-09', period: 'September 2024', processedOn: null, employeeCount: 24, totalPaid: 0, status: 'pending' },
]

export const jobOpenings = [
  { id: 'JOB-501', title: 'Senior Architect', department: 'Architecture', location: 'Mumbai', openings: 2, status: 'open', postedDate: '2024-08-20' },
  { id: 'JOB-502', title: 'Site Engineer', department: 'Site Execution', location: 'Pune', openings: 1, status: 'open', postedDate: '2024-09-01' },
  { id: 'JOB-503', title: '3D Visualizer', department: 'Design', location: 'Bengaluru', openings: 1, status: 'open', postedDate: '2024-09-10' },
  { id: 'JOB-504', title: 'Procurement Executive', department: 'Procurement', location: 'Mumbai', openings: 1, status: 'closed', postedDate: '2024-06-15' },
]

export const candidates = [
  { id: 'CAND-601', name: 'Kunal Sharma', job: 'JOB-501', stage: 'Interview', experience: '8 yrs', email: 'kunal.sharma@email.com', phone: '+91 90000 11111', appliedDate: '2024-08-25' },
  { id: 'CAND-602', name: 'Sneha Iyer', job: 'JOB-501', stage: 'Screening', experience: '6 yrs', email: 'sneha.iyer@email.com', phone: '+91 90000 22222', appliedDate: '2024-09-02' },
  { id: 'CAND-603', name: 'Rahul Desai', job: 'JOB-502', stage: 'Evaluation', experience: '4 yrs', email: 'rahul.desai@email.com', phone: '+91 90000 33333', appliedDate: '2024-09-05' },
  { id: 'CAND-604', name: 'Priyanka Nambiar', job: 'JOB-503', stage: 'Offer', experience: '3 yrs', email: 'priyanka.nambiar@email.com', phone: '+91 90000 44444', appliedDate: '2024-08-18' },
  { id: 'CAND-605', name: 'Vishal Kumar', job: 'JOB-502', stage: 'Applications', experience: '5 yrs', email: 'vishal.kumar@email.com', phone: '+91 90000 55555', appliedDate: '2024-09-14' },
]

export const recruitmentStages = ['Applications', 'Screening', 'Interview', 'Evaluation', 'Selected', 'Offer', 'Onboarding']
