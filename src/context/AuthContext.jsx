import { createContext, useContext, useEffect, useState } from 'react'
import { allAuthUsers, DEMO_PASSWORD, getAuthUserByEmail, getAuthUserById } from '../data/authUsers'

const AuthContext = createContext(null)

// Authentication flow: Login -> validate user -> reject disabled accounts ->
// load employee/role/permission profile (already resolved onto the account
// by buildAuthUser in data/authUsers.js) -> create session -> caller
// redirects to the role-appropriate landing page.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lax360-user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      if (user) localStorage.setItem('lax360-user', JSON.stringify(user))
      else localStorage.removeItem('lax360-user')
    } catch {
      // ignore storage errors
    }
  }, [user])

  // If the signed-in account gets deactivated elsewhere in the same
  // session (Administration -> Users), invalidate the session immediately.
  useEffect(() => {
    if (user && user.status === 'inactive') {
      setUser(null)
      setError('This account has been deactivated. Contact your administrator.')
    }
  }, [user])

  async function login(email, password) {
    setLoading(true)
    setError(null)
    await new Promise((r) => setTimeout(r, 500))
    const found = getAuthUserByEmail(email)
    setLoading(false)
    if (!found || password !== DEMO_PASSWORD) {
      const err = 'Invalid email or password. Try any demo account with password "lax360demo".'
      setError(err)
      throw new Error(err)
    }
    if (found.status === 'inactive') {
      const err = 'This account has been deactivated. Contact your administrator.'
      setError(err)
      throw new Error(err)
    }
    setUser(found)
    return found
  }

  function loginAs(userId) {
    const found = getAuthUserById(userId)
    if (found && found.status !== 'inactive') setUser(found)
    return found
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, loginAs, logout, isAuthenticated: !!user, demoAccounts: allAuthUsers }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
