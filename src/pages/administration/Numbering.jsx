import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Pencil, Hash } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { adminApi } from '../../api/adminApi'
import { usePermissions } from '../../context/PermissionContext'

export default function Numbering() {
  const { can } = usePermissions()
  const allowEdit = can('administration', 'edit')
  const [loading, setLoading] = useState(true)
  const [schemes, setSchemes] = useState([])
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    adminApi.numberingSchemes().then((data) => {
      setSchemes(data)
      setLoading(false)
    })
  }, [])

  function openEdit(scheme) {
    reset(scheme)
    setEditing(scheme)
  }

  function onSubmit(values) {
    setSchemes((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...values } : s)))
    toast.success(`${values.document} numbering scheme updated`)
    setEditing(null)
  }

  return (
    <div>
      <PageHeader title="Numbering Schemes" subtitle="Auto-numbering formats for quotations, invoices, purchase orders and projects" />
      <PageBody>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : schemes.length === 0 ? (
          <Card><EmptyState icon={Hash} title="No numbering schemes configured" /></Card>
        ) : (
          <Card padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-ink-muted">
                    <th className="px-5 py-3 font-medium">Document Type</th>
                    <th className="px-5 py-3 font-medium">Format</th>
                    <th className="px-5 py-3 font-medium">Next Number</th>
                    {allowEdit && <th className="px-5 py-3 font-medium text-right"></th>}
                  </tr>
                </thead>
                <tbody>
                  {schemes.map((s) => (
                    <tr key={s.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-subtle">
                      <td className="px-5 py-3 font-medium text-ink">{s.document}</td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-muted">{s.format}</td>
                      <td className="px-5 py-3 font-mono text-xs font-medium text-ink">{s.nextNumber}</td>
                      {allowEdit && (
                        <td className="px-5 py-3 text-right">
                          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(s)}>Edit</Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </PageBody>

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.document || ''} Numbering`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save changes</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Document Type" required error={errors.document?.message}>
            <Input {...register('document', { required: 'Document type is required' })} />
          </Field>
          <Field label="Format" required error={errors.format?.message} hint="Use tokens like {YYYY} and {####}">
            <Input {...register('format', { required: 'Format is required' })} className="font-mono" />
          </Field>
          <Field label="Next Number Preview" required error={errors.nextNumber?.message}>
            <Input {...register('nextNumber', { required: 'Next number is required' })} className="font-mono" />
          </Field>
        </form>
      </Drawer>
    </div>
  )
}
