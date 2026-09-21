import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { MailCheck, ArrowLeft } from 'lucide-react'
import { Field, Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink font-[Inter_Tight]">Check your inbox</h1>
        <p className="mt-1.5 text-sm text-ink-muted">We've sent password reset instructions to your email address.</p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">Forgot password?</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Enter your work email and we'll send you a link to reset it.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4">
        <Field label="Work email" required error={errors.email?.message}>
          <Input type="email" placeholder="you@lax360.com" {...register('email', { required: 'Email is required' })} />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full justify-center">
          Send reset link
        </Button>
      </form>
      <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </Link>
    </div>
  )
}
