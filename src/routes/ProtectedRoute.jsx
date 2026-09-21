import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePermissions } from '../context/PermissionContext'

// Guards every internal route: unauthenticated users go to /login, a signed
// -in Client account is kept out of the internal ERP shell entirely (client
// isolation), and any route with a required permission (see
// utils/permissions.ROUTE_PERMISSIONS) is checked before children ever
// mount — an unauthorized user never sees a flash of the real page.
export function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  const { canRoute } = usePermissions()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (user?.portal === 'client' && location.pathname !== '/client-portal') {
    return <Navigate to="/client-portal" replace />
  }
  if (!canRoute(location.pathname)) {
    return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />
  }
  return children
}
