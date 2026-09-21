import { useNavigate } from 'react-router-dom'
import { TimerOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export default function SessionExpired() {
  const navigate = useNavigate()
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40">
        <TimerOff className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-ink font-[Inter_Tight]">Your session has expired</h1>
      <p className="mt-1.5 text-sm text-ink-muted">For your security, you've been signed out after a period of inactivity.</p>
      <Button size="lg" className="mt-6 w-full justify-center" onClick={() => navigate('/login')}>
        Sign in again
      </Button>
    </div>
  )
}
