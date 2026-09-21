import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export default function VerifyEmail() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950">
        <MailCheck className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-ink font-[Inter_Tight]">Verify your email</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        We've sent a verification link to your work email. Click the link to activate your LAX360 account.
      </p>
      <Link to="/login">
        <Button size="lg" variant="secondary" className="mt-6 w-full justify-center">
          Back to sign in
        </Button>
      </Link>
      <p className="mt-4 text-xs text-ink-faint">
        Didn't get the email?{' '}
        <button className="font-medium text-brand-600 hover:text-brand-700">Resend link</button>
      </p>
    </div>
  )
}
