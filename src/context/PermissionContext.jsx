import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { can as canCheck, permissionForRoute, canAccessProject, canAccessTask, DATA_SCOPES } from '../utils/permissions'

const PermissionContext = createContext(null)

export { canAccessProject, canAccessTask }

export function PermissionProvider({ children }) {
  const { user } = useAuth()

  const value = useMemo(() => {
    const permissions = user?.permissions || []
    const can = (module, action = 'view') => canCheck(permissions, module, action)
    const canRoute = (pathname) => {
      const required = permissionForRoute(pathname)
      if (!required) return true
      const [module, action] = required.split('.')
      return can(module, action)
    }
    return {
      permissions,
      dataScope: user?.dataScope || DATA_SCOPES.OWN,
      can,
      canRoute,
      canAccessProject: (project) => canAccessProject(user, project),
      canAccessTask: (taskRecord) => canAccessTask(user, taskRecord),
      isRole: (roleId) => user?.roleId === roleId,
      isAtLeast: (level) => (user?.roleLevel ?? 0) >= level,
    }
  }, [user])

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export function usePermissions() {
  const ctx = useContext(PermissionContext)
  if (!ctx) throw new Error('usePermissions must be used within PermissionProvider')
  return ctx
}
