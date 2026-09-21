import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Percent } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { adminApi } from '../../api/adminApi'
import { usePermissions } from '../../context/PermissionContext'

export default function TaxSettings() {
  const { can } = usePermissions()
  const allowEdit = can('administration', 'edit')
  const [loading, setLoading] = useState(true)
  const [rates, setRates] = useState([])
  const [drawer, setDrawer] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { name: '', rate: 18, appliesTo: '', status: 'active' } })

  useEffect(() => {
    adminApi.taxSettings().then((data) => {
      setRates(data)
      setLoading(false)
    })
  }, [])

  function onSubmit(values) {
    const record = { id: `TAX-${rates.length + 1}-${Date.now().toString().slice(-4)}`, ...values, rate: Number(values.rate) || 0 }
    setRates((prev) => [...prev, record])
    toast.success('Tax rate added')
    reset({ name: '', rate: 18, appliesTo: '', status: 'active' })
    setDrawer(false)
  }

  return (
    <div>
      <PageHeader
        title="Tax Settings"
        subtitle="GST and TDS rates applied across quotations, invoices and purchase orders"
        actions={allowEdit ? <Button icon={Plus} onClick={() => setDrawer(true)}>Add Tax Rate</Button> : null}
      />
      <PageBody>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : rates.length === 0 ? (
          <Card><EmptyState icon={Percent} title="No tax rates configured" description="Add your first tax rate to apply it across documents." action={allowEdit ? { label: 'Add Tax Rate', icon: Plus, onClick: () => setDrawer(true) } : undefined} /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rates.map((r) => (
              <Card key={r.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950">
                    <Percent className="h-4.5 w-4.5" />
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">Applies to {r.appliesTo}</p>
                </div>
                <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                  <span className="text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">{r.rate}%</span>
                  <Badge>{r.id}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageBody>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Add Tax Rate"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Add Tax Rate</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Tax Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} placeholder="e.g. GST 18%" />
          </Field>
          <Field label="Rate (%)" required error={errors.rate?.message}>
            <Input type="number" step="0.1" min="0" max="100" {...register('rate', { required: 'Rate is required' })} />
          </Field>
          <Field label="Applies To" required error={errors.appliesTo?.message}>
            <Input {...register('appliesTo', { required: 'This field is required' })} placeholder="e.g. Professional Services" />
          </Field>
          <Field label="Status">
            <Select {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </form>
      </Drawer>
    </div>
  )
}
