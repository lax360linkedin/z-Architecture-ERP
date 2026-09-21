import { Navigate, useLocation } from 'react-router-dom'
import { usePermissions } from '../context/PermissionContext'

// Wrap a route element to require a specific "module.action" permission
// (e.g. "administration.roles"). Renders /unauthorized instead of the page
// content when the signed-in user lacks it — content never mounts first.
export function PermissionGuard({ permission, children }) {
  const { can } = usePermissions()
  const location = useLocation()
  const [module, action] = permission.split('.')
  if (!can(module, action)) {
    return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />
  }
  return children
}

// Wrap a route element to require one of the given role ids.
export function RoleGuard({ roles, children }) {
  const { isRole } = usePermissions()
  const location = useLocation()
  if (!roles.some((r) => isRole(r))) {
    return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />
  }
  return children
}

// Inline conditional — hides (rather than redirects) a button/section the
// user isn't permitted to use. Usage: <Can module="projects" action="delete">…</Can>
export function Can({ module, action = 'view', children, fallback = null }) {
  const { can } = usePermissions()
  return can(module, action) ? children : fallback
}
