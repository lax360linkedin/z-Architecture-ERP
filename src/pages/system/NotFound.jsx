import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-surface-subtle px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950">
        <Compass className="h-7 w-7" />
      </div>
      <div>
        <p className="text-4xl font-bold tracking-tight text-ink font-[Inter_Tight]">404</p>
        <h1 className="mt-1 text-lg font-bold text-ink">Page not found</h1>
        <p className="mt-1 max-w-md text-sm text-ink-muted">The page you're looking for doesn't exist or may have been moved.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
      </div>
    </div>
  )
}
