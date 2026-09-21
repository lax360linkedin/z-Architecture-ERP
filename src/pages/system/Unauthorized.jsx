import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function Unauthorized() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const from = location.state?.from

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-surface-subtle px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <div>
        <p className="text-4xl font-bold tracking-tight text-ink font-[Inter_Tight]">403</p>
        <h1 className="mt-1 text-lg font-bold text-ink">Unauthorized</h1>
        <p className="mt-1 max-w-md text-sm text-ink-muted">You do not have permission to access this resource.</p>
        {user && (
          <p className="mt-2 text-xs text-ink-faint">
            Signed in as <span className="font-medium text-ink-muted">{user.name}</span> ({user.role}){from && <> — blocked route: <span className="font-mono">{from}</span></>}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
      </div>
    </div>
  )
}
