import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { KeyRound } from 'lucide-react'
import { Field, Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const password = watch('password')

  async function onSubmit() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    toast.success('Password reset successfully. Please sign in.')
    navigate('/login')
  }

  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950">
        <KeyRound className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">Set a new password</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Choose a strong password you haven't used before.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4">
        <Field label="New password" required error={errors.password?.message}>
          <Input type="password" placeholder="••••••••••" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })} />
        </Field>
        <Field label="Confirm password" required error={errors.confirm?.message}>
          <Input type="password" placeholder="••••••••••" {...register('confirm', { required: 'Please confirm your password', validate: (v) => v === password || 'Passwords do not match' })} />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full justify-center">
          Reset password
        </Button>
      </form>
    </div>
  )
}
