import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/Input'
import { FileUpload } from '../../components/ui/FileUpload'
import { Skeleton } from '../../components/ui/Skeleton'
import { LogoMark } from '../../components/layout/Logo'
import { adminApi } from '../../api/adminApi'
import { usePermissions } from '../../context/PermissionContext'

export default function Company() {
  const { can } = usePermissions()
  const allowEdit = can('administration', 'edit')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    adminApi.company().then((c) => {
      reset(c)
      setLoading(false)
    })
  }, [reset])

  function onSubmit() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Company details saved')
    }, 400)
  }

  return (
    <div>
      <PageHeader title="Company Settings" subtitle="Manage your organization's identity and registration details" />
      <PageBody className="flex flex-col gap-5">
        <Card>
          <CardHeader title="Company Logo" subtitle="Shown across the ERP and on generated documents" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-subtle p-3">
              <LogoMark className="h-full w-full" />
            </div>
            <div className="flex-1">
              {allowEdit ? (
                <FileUpload
                  multiple={false}
                  accept="image/*"
                  hint="PNG or SVG, square aspect ratio recommended, up to 5MB"
                  onFiles={() => toast.success('Logo updated')}
                />
              ) : (
                <p className="text-sm text-ink-faint">You don't have permission to change the company logo.</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Company Details" subtitle="Legal and registration information used on invoices and quotations" />
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9.5 w-full" />)}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <fieldset disabled={!allowEdit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Company Name" required error={errors.name?.message}>
                    <Input {...register('name', { required: 'Company name is required' })} />
                  </Field>
                  <Field label="Legal Name" required error={errors.legalName?.message}>
                    <Input {...register('legalName', { required: 'Legal name is required' })} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="GSTIN" required error={errors.gstin?.message}>
                    <Input {...register('gstin', { required: 'GSTIN is required' })} />
                  </Field>
                  <Field label="PAN" required error={errors.pan?.message}>
                    <Input {...register('pan', { required: 'PAN is required' })} />
                  </Field>
                </div>
                <Field label="Registered Address" required error={errors.address?.message}>
                  <Textarea rows={3} {...register('address', { required: 'Address is required' })} />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Phone" required error={errors.phone?.message}>
                    <Input {...register('phone', { required: 'Phone is required' })} />
                  </Field>
                  <Field label="Email" required error={errors.email?.message}>
                    <Input type="email" {...register('email', { required: 'Email is required' })} />
                  </Field>
                  <Field label="Website">
                    <Input {...register('website')} />
                  </Field>
                </div>
              </fieldset>
              {allowEdit && (
                <div className="flex justify-end border-t border-border-subtle pt-4">
                  <Button type="submit" icon={Save} loading={saving}>
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          )}
        </Card>
      </PageBody>
    </div>
  )
}
