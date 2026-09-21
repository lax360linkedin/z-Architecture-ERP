import { useMemo, useState } from 'react'
import { Building2, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar, AvatarGroup } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { employees } from '../../data/employees'
import { DEPARTMENTS } from '../../utils/constants'
import { classNames } from '../../utils/format'

export default function Departments() {
  const [expanded, setExpanded] = useState(null)

  const departmentData = useMemo(
    () =>
      DEPARTMENTS.map((dept) => {
        const members = employees.filter((e) => e.department === dept)
        const head = members.find((m) => m.manager == null) || members[0]
        return { name: dept, members, head, activeCount: members.filter((m) => m.status === 'active').length }
      }),
    []
  )

  return (
    <div>
      <PageHeader title="Departments" subtitle={`${DEPARTMENTS.length} departments · ${employees.length} employees total`} />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departmentData.map((dept) => (
            <Card
              key={dept.name}
              className="flex cursor-pointer flex-col gap-3.5"
              onClick={() => setExpanded((prev) => (prev === dept.name ? null : dept.name))}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950">
                    <Building2 className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{dept.name}</p>
                    <p className="text-xs text-ink-faint">{dept.members.length} member{dept.members.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {expanded === dept.name ? <ChevronUp className="h-4 w-4 text-ink-faint" /> : <ChevronDown className="h-4 w-4 text-ink-faint" />}
              </div>

              {dept.members.length === 0 ? (
                <p className="text-xs text-ink-faint">No employees assigned yet.</p>
              ) : (
                <div className="flex items-center justify-between">
                  <AvatarGroup names={dept.members.map((m) => m.name)} />
                  <span className="flex items-center gap-1 text-xs text-ink-muted">
                    <Users className="h-3.5 w-3.5" /> {dept.activeCount} active
                  </span>
                </div>
              )}

              {dept.head && (
                <p className="border-t border-border-subtle pt-3 text-xs text-ink-muted">
                  Lead: <span className="font-medium text-ink">{dept.head.name}</span>
                </p>
              )}
            </Card>
          ))}
        </div>

        {expanded && (
          <Card padded={false}>
            <CardHeader title={`${expanded} — Team Members`} className="px-5 pt-5" />
            {departmentData.find((d) => d.name === expanded)?.members.length === 0 ? (
              <div className="px-5 pb-5"><EmptyState title="No employees in this department" /></div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {departmentData
                  .find((d) => d.name === expanded)
                  ?.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-ink">{m.name}</p>
                          <p className="text-xs text-ink-faint">{m.designation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={classNames('text-xs text-ink-faint')}>{m.location}</span>
                        <StatusBadge status={m.status} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        )}
      </PageBody>
    </div>
  )
}
