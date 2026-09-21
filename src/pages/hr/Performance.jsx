import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { employees } from '../../data/employees'
import { projects } from '../../data/projects'
import { timesheets } from '../../data/timesheets'
import { classNames } from '../../utils/format'

export default function Performance() {
  const [sort, setSort] = useState({ by: 'hours', dir: 'desc' })

  const rows = useMemo(() => {
    return employees.map((e) => {
      const assignedProjects = projects.filter((p) => p.team?.includes(e.id) || p.manager === e.id)
      const empTimesheets = timesheets.filter((t) => t.employee === e.id)
      const hours = empTimesheets.reduce((s, t) => s + t.hours, 0)
      const billableHours = empTimesheets.filter((t) => t.billable).reduce((s, t) => s + t.hours, 0)
      return {
        ...e,
        projectCount: assignedProjects.length,
        hours,
        billableHours,
        utilization: hours ? Math.round((billableHours / hours) * 100) : 0,
      }
    })
  }, [])

  const sorted = useMemo(() => {
    const list = [...rows]
    list.sort((a, b) => {
      const av = a[sort.by]
      const bv = b[sort.by]
      if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av
      return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return list
  }, [rows, sort])

  function toggleSort(field) {
    setSort((prev) => (prev.by === field ? { by: field, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { by: field, dir: 'desc' }))
  }

  function SortIcon({ field }) {
    if (sort.by !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />
    return sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  return (
    <div>
      <PageHeader
        title="Team Utilization & Contribution Overview"
        subtitle="Ranked by project load and logged hours across the organization"
      />
      <PageBody>
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="px-4 py-3 font-medium">
                    <button onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 hover:text-ink">Employee <SortIcon field="name" /></button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button onClick={() => toggleSort('department')} className="inline-flex items-center gap-1 hover:text-ink">Department <SortIcon field="department" /></button>
                  </th>
                  <th className="px-4 py-3 font-medium">Designation</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">
                    <button onClick={() => toggleSort('projectCount')} className="inline-flex items-center gap-1 hover:text-ink">Projects Assigned <SortIcon field="projectCount" /></button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button onClick={() => toggleSort('hours')} className="inline-flex items-center gap-1 hover:text-ink">Hours Logged <SortIcon field="hours" /></button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button onClick={() => toggleSort('utilization')} className="inline-flex items-center gap-1 hover:text-ink">Billable Utilization <SortIcon field="utilization" /></button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.name} size="sm" />
                        <p className="font-medium text-ink">{r.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{r.department}</td>
                    <td className="px-4 py-3 text-ink-muted">{r.designation}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-ink">{r.projectCount}</td>
                    <td className="px-4 py-3 text-ink">{r.hours}h</td>
                    <td className="px-4 py-3">
                      <span className={classNames('font-medium', r.utilization >= 70 ? 'text-emerald-600' : r.utilization >= 40 ? 'text-amber-600' : 'text-ink-muted')}>
                        {r.utilization}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
