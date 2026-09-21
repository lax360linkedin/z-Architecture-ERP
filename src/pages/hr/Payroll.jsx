import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlayCircle, Mail, Phone, Calendar } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { Pills } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/layout/PageLoader'
import { LogoMark } from '../../components/layout/Logo'
import { hrApi } from '../../api/hrApi'
import { logAudit } from '../../api/auditLogApi'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { getEmployeeById, getEmployeeName } from '../../data/employees'
import { formatCurrency, formatDate } from '../../utils/format'

export default function Payroll() {
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowProcess = can('payroll', 'create')
  const [view, setView] = useState('structures')
  const [loading, setLoading] = useState(true)
  const [structures, setStructures] = useState([])
  const [runs, setRuns] = useState([])
  const [processingId, setProcessingId] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState('')

  useEffect(() => {
    Promise.all([hrApi.salaryStructures(), hrApi.payrollRuns()]).then(([s, r]) => {
      setStructures(s)
      setRuns(r)
      if (s[0]) setSelectedEmployee(s[0].employee)
      setLoading(false)
    })
  }, [])

  async function processPayroll(run) {
    setProcessingId(run.id)
    await new Promise((res) => setTimeout(res, 600))
    setRuns((prev) => prev.map((r) => (r.id === run.id ? { ...r, status: 'processed', processedOn: new Date().toISOString().slice(0, 10), totalPaid: structures.reduce((s, x) => s + x.netPay, 0) * (r.employeeCount / Math.max(1, structures.length)) } : r)))
    logAudit({ user, action: 'Processed payroll run', module: 'HR', record: run.id, change: `${run.period}: processed` })
    toast.success(`Payroll for ${run.period} processed successfully`)
    setProcessingId(null)
  }

  if (loading) return <PageLoader />

  const selectedStructure = structures.find((s) => s.employee === selectedEmployee)
  const selectedEmp = selectedStructure ? getEmployeeById(selectedStructure.employee) : null

  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle={`${structures.length} employees on active payroll`}
        actions={<Pills value={view} onChange={setView} options={[{ value: 'structures', label: 'Salary Structures' }, { value: 'runs', label: 'Payroll Runs' }, { value: 'payslip', label: 'Payslip Preview' }]} />}
      />
      <PageBody>
        {view === 'structures' && (
          <Card padded={false}>
            {structures.length === 0 ? <EmptyState title="No salary structures configured" /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-ink-muted">
                      <th className="px-4 py-3 font-medium">Employee</th>
                      <th className="px-4 py-3 font-medium">Basic</th>
                      <th className="px-4 py-3 font-medium">HRA</th>
                      <th className="px-4 py-3 font-medium">Allowances</th>
                      <th className="px-4 py-3 font-medium">PF</th>
                      <th className="px-4 py-3 font-medium">Tax</th>
                      <th className="px-4 py-3 font-medium">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.map((s) => (
                      <tr key={s.employee} className="border-b border-border-subtle last:border-0">
                        <td className="px-4 py-3 font-medium text-ink">{getEmployeeName(s.employee)}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatCurrency(s.basic)}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatCurrency(s.hra)}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatCurrency(s.allowances)}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatCurrency(s.pf)}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatCurrency(s.tax)}</td>
                        <td className="px-4 py-3 font-semibold text-ink">{formatCurrency(s.netPay)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {view === 'runs' && (
          <Card padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-ink-muted">
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Employees</th>
                    <th className="px-4 py-3 font-medium">Total Paid</th>
                    <th className="px-4 py-3 font-medium">Processed On</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{r.period}</td>
                      <td className="px-4 py-3 text-ink-muted">{r.employeeCount}</td>
                      <td className="px-4 py-3 text-ink-muted">{r.totalPaid ? formatCurrency(r.totalPaid, { compact: true }) : '—'}</td>
                      <td className="px-4 py-3 text-ink-muted">{r.processedOn ? formatDate(r.processedOn) : '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {r.status === 'pending' ? (
                          allowProcess ? (
                            <Button size="sm" icon={PlayCircle} loading={processingId === r.id} onClick={() => processPayroll(r)}>Process Payroll</Button>
                          ) : (
                            <span className="text-xs text-ink-faint">Pending</span>
                          )
                        ) : (
                          <span className="text-xs text-ink-faint">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {view === 'payslip' && (
          <div className="flex flex-col gap-4">
            <Card className="max-w-xs">
              <Select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                {structures.map((s) => (
                  <option key={s.employee} value={s.employee}>{getEmployeeName(s.employee)}</option>
                ))}
              </Select>
            </Card>

            {!selectedStructure ? (
              <Card><EmptyState title="Select an employee" description="Choose an employee above to preview their payslip." /></Card>
            ) : (
              <Card className="mx-auto w-full max-w-2xl overflow-hidden !p-0">
                <div className="flex items-center justify-between bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-5 text-white">
                  <div className="flex items-center gap-3">
                    <LogoMark className="h-10 w-10" />
                    <div>
                      <p className="text-sm font-bold tracking-tight">LAX360 Architecture ERP</p>
                      <p className="text-xs text-white/80">Payslip · {mostRecentPeriod(runs)}</p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-white/90">CONFIDENTIAL</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-border px-6 py-5 text-sm sm:grid-cols-4">
                  <div><p className="text-xs text-ink-faint">Employee</p><p className="mt-0.5 font-medium text-ink">{selectedEmp?.name}</p></div>
                  <div><p className="text-xs text-ink-faint">Employee ID</p><p className="mt-0.5 font-medium text-ink">{selectedEmp?.id}</p></div>
                  <div><p className="text-xs text-ink-faint">Designation</p><p className="mt-0.5 font-medium text-ink">{selectedEmp?.designation}</p></div>
                  <div><p className="text-xs text-ink-faint">Department</p><p className="mt-0.5 font-medium text-ink">{selectedEmp?.department}</p></div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted"><Mail className="h-3.5 w-3.5" />{selectedEmp?.email}</div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted"><Phone className="h-3.5 w-3.5" />{selectedEmp?.phone}</div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted"><Calendar className="h-3.5 w-3.5" />Joined {formatDate(selectedEmp?.joiningDate)}</div>
                </div>

                <div className="grid grid-cols-1 gap-6 px-6 py-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Earnings</p>
                    <div className="flex flex-col divide-y divide-border-subtle text-sm">
                      <PayRow label="Basic" value={selectedStructure.basic} />
                      <PayRow label="HRA" value={selectedStructure.hra} />
                      <PayRow label="Allowances" value={selectedStructure.allowances} />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Deductions</p>
                    <div className="flex flex-col divide-y divide-border-subtle text-sm">
                      <PayRow label="Provident Fund" value={selectedStructure.pf} />
                      <PayRow label="Tax (TDS)" value={selectedStructure.tax} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-surface-subtle px-6 py-4">
                  <p className="text-sm font-semibold text-ink">Net Pay</p>
                  <p className="text-xl font-bold text-brand-600 font-[Inter_Tight]">{formatCurrency(selectedStructure.netPay)}</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </PageBody>
    </div>
  )
}

function PayRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-ink-muted">{label}</p>
      <p className="font-medium text-ink">{formatCurrency(value)}</p>
    </div>
  )
}

function mostRecentPeriod(runs) {
  return runs[runs.length - 1]?.period || 'Current Period'
}
