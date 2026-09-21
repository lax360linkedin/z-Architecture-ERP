import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, Minus } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Pills } from '../../components/ui/Tabs'
import { Skeleton } from '../../components/ui/Skeleton'
import { adminApi } from '../../api/adminApi'
import { classNames } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'
import { useAuth } from '../../context/AuthContext'
import { logAudit } from '../../api/auditLogApi'

const PERMISSION_KEYS = ['view', 'create', 'edit', 'delete', 'approve']

export default function Roles() {
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowManageRoles = can('administration', 'roles')
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState([])
  const [permissions, setPermissions] = useState({})
  const [role, setRole] = useState(null)

  useEffect(() => {
    Promise.all([adminApi.permissionModules(), adminApi.rolePermissions()]).then(([mods, perms]) => {
      setModules(mods)
      setPermissions(perms)
      setRole(Object.keys(perms)[0])
      setLoading(false)
    })
  }, [])

  const roleOptions = useMemo(() => Object.keys(permissions).map((r) => ({ value: r, label: r })), [permissions])

  function togglePermission(moduleName, key) {
    if (!allowManageRoles) return
    const current = permissions[role]?.[moduleName]?.[key]
    const next = !current
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleName]: { ...prev[role][moduleName], [key]: next },
      },
    }))
    toast.success('Permission updated')
    logAudit({
      user,
      action: 'Changed role permission',
      module: 'Administration',
      record: role,
      change: `${moduleName}.${key}: ${next ? 'granted' : 'revoked'}`,
    })
  }

  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="Configure what each role can view, create, edit, delete and approve" />
      <PageBody className="flex flex-col gap-4">
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <>
            <Pills value={role} onChange={setRole} options={roleOptions} />
            <Card padded={false}>
              <CardHeader title={`${role} — Permission Matrix`} subtitle="Click a cell to toggle access for this role" className="px-5 pt-5" />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-y border-border text-xs text-ink-muted">
                      <th className="px-5 py-3 font-medium">Module</th>
                      {PERMISSION_KEYS.map((k) => (
                        <th key={k} className="px-4 py-3 text-center font-medium capitalize">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((m) => (
                      <tr key={m} className="border-b border-border-subtle last:border-0 hover:bg-surface-subtle">
                        <td className="px-5 py-3 font-medium text-ink">{m}</td>
                        {PERMISSION_KEYS.map((k) => {
                          const allowed = !!permissions[role]?.[m]?.[k]
                          return (
                            <td key={k} className="px-4 py-3 text-center">
                              <button
                                onClick={() => togglePermission(m, k)}
                                disabled={!allowManageRoles}
                                className={classNames(
                                  'inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
                                  allowed
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'border-border text-ink-faint hover:bg-surface-subtle',
                                  !allowManageRoles && 'cursor-not-allowed opacity-60 hover:bg-transparent'
                                )}
                                aria-label={`Toggle ${k} for ${m}`}
                              >
                                {allowed ? <Check className="h-4 w-4" /> : <Minus className="h-3.5 w-3.5" />}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </PageBody>
    </div>
  )
}
