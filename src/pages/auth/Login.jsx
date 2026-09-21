import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { FlaskConical } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Field, Input, Checkbox } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { classNames } from '../../utils/format'
import { allAuthUsers } from '../../data/authUsers'

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues: { email: 'arjun.mehta@lax360.com', password: 'lax360demo' } })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function onSubmit(values) {
    setLoading(true)
    try {
      await login(values.email, values.password)
      toast.success('Welcome back to LAX360')
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">Sign in to LAX360</h1>
      <p className="mt-1.5 text-sm text-ink-muted">Enter your credentials to access your workspace.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4">
        <Field label="Work email" required error={errors.email?.message}>
          <Input type="email" placeholder="you@lax360.com" {...register('email', { required: 'Email is required' })} />
        </Field>
        <Field label="Password" required error={errors.password?.message}>
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" className="pr-10" {...register('password', { required: 'Password is required' })} />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" defaultChecked />
          <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={loading} icon={LogIn} className="mt-1 w-full justify-center">
          Sign in
        </Button>
      </form>

      <div className="mt-7">
        <div className="mb-2 flex items-center gap-1.5">
          <FlaskConical className="h-3 w-3 text-amber-500" />
          <p className="text-xs font-medium text-ink-faint">Quick demo sign-in — Development / Demo Mode, all 15 roles</p>
        </div>
        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1">
          {allAuthUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setValue('email', u.email)
                setValue('password', 'lax360demo')
              }}
              className={classNames(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
                u.status === 'inactive'
                  ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400'
                  : 'border-border bg-surface-raised text-ink-muted hover:border-brand-300 hover:text-brand-700'
              )}
            >
              {u.role}
              {u.status === 'inactive' && <Badge color="danger" className="text-[9px]">Disabled</Badge>}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-faint">
        Demo password for every account: <span className="font-mono font-medium text-ink-muted">lax360demo</span>
      </p>
    </div>
  )
}
