import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { PageHeader, PageBody } from '../layout/PageHeader'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { SearchInput, Select, Field, Input, Textarea } from '../ui/Input'
import { DataTable } from '../ui/DataTable'
import { Drawer } from '../ui/Drawer'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Dropdown, DropdownItem } from '../ui/Dropdown'
import { MoreHorizontal } from 'lucide-react'
import { useDataTable } from '../../hooks/useDataTable'
import { usePermissions } from '../../context/PermissionContext'

export function EntityListPage({
  title,
  subtitle,
  api,
  columns,
  filters = [],
  formFields = [],
  searchPlaceholder = 'Search…',
  emptyStateTitle = 'No records found',
  emptyStateDescription = 'Create your first record to get started.',
  detailRenderer,
  createLabel,
  defaultValues = {},
  extraActions,
  pageSize = 8,
  // Optional module key (e.g. "vendors") checked against the signed-in
  // user's permissions to gate Create/Edit/Delete. Omit to leave the page
  // unrestricted (used by pages the route guard already fully protects).
  permissionModule,
}) {
  const { can } = usePermissions()
  const allowCreate = !permissionModule || can(permissionModule, 'create')
  const allowEdit = !permissionModule || can(permissionModule, 'edit')
  const allowDelete = !permissionModule || can(permissionModule, 'delete')
  const table = useDataTable(api.list, { pageSize, initialFilters: Object.fromEntries(filters.map((f) => [f.key, 'all'])) })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [detail, setDetail] = useState(null)
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({ defaultValues })

  function openCreate() {
    reset(defaultValues)
    setDrawer({ open: true, mode: 'create', record: null })
  }

  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      if (drawer.mode === 'create') {
        await api.create(values)
        toast.success(`${title.replace(/s$/, '')} created successfully`)
      } else {
        await api.update(drawer.record.id, values)
        toast.success(`${title.replace(/s$/, '')} updated successfully`)
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await api.remove(confirm.record.id)
      toast.success('Record deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const hasRowActions = !!detailRenderer || allowEdit || allowDelete
  const tableColumns = [
    ...columns,
    ...(hasRowActions
      ? [{
          key: '__actions',
          header: '',
          className: 'text-right',
          render: (row) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown
                align="right"
                width="w-44"
                trigger={
                  <button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
              >
                {detailRenderer && (
                  <DropdownItem icon={Eye} onClick={() => setDetail(row)}>
                    View details
                  </DropdownItem>
                )}
                {allowEdit && (
                  <DropdownItem icon={Pencil} onClick={() => openEdit(row)}>
                    Edit
                  </DropdownItem>
                )}
                {allowDelete && (
                  <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: row })}>
                    Delete
                  </DropdownItem>
                )}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {extraActions}
            {allowCreate && (
              <Button icon={Plus} onClick={openCreate}>
                {createLabel || `New ${title.replace(/s$/, '')}`}
              </Button>
            )}
          </>
        }
      />
      <PageBody>
        <Card padded={false}>
          <DataTable
            columns={tableColumns}
            data={table.items}
            loading={table.loading}
            error={table.error}
            onRetry={table.refresh}
            selectable={allowDelete}
            selected={selected}
            onSelectedChange={setSelected}
            sort={table.sort}
            onSortChange={table.toggleSort}
            onRowClick={detailRenderer ? (row) => setDetail(row) : undefined}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{
              title: emptyStateTitle,
              description: emptyStateDescription,
              action: allowCreate ? { label: createLabel || 'Create new', icon: Plus, onClick: openCreate } : undefined,
            }}
            bulkActions={
              allowDelete
                ? [
                    {
                      label: 'Delete',
                      icon: Trash2,
                      onClick: async (ids) => {
                        await Promise.all(ids.map((id) => api.remove(id)))
                        toast.success(`${ids.length} record(s) deleted`)
                        setSelected([])
                        table.refresh()
                      },
                    },
                  ]
                : []
            }
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder={searchPlaceholder} className="w-full max-w-xs" />
                {filters.map((f) => (
                  <Select
                    key={f.key}
                    value={table.filters[f.key] || 'all'}
                    onChange={(e) => table.setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-auto min-w-[140px]"
                  >
                    <option value="all">All {f.label}</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                ))}
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? createLabel || `New ${title.replace(/s$/, '')}` : `Edit ${title.replace(/s$/, '')}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>
              {drawer.mode === 'create' ? 'Create' : 'Save changes'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {formFields.map((field) => (
            <FormField key={field.name} field={field} register={register} control={control} error={errors[field.name]} />
          ))}
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title={`Delete this ${title.replace(/s$/, '').toLowerCase()}?`}
        description="This action cannot be undone. This will permanently remove the record."
        confirmLabel="Delete"
      />

      {detailRenderer && (
        <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail ? columns[0]?.render?.(detail) ?? detail[columns[0]?.key] : ''} size="lg">
          {detail && detailRenderer(detail)}
        </Drawer>
      )}
    </div>
  )
}

function FormField({ field, register, control, error }) {
  const required = field.required
  const rules = { required: required ? `${field.label} is required` : false }

  if (field.type === 'select') {
    return (
      <Field label={field.label} required={required} error={error?.message}>
        <Select {...register(field.name, rules)}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </Select>
      </Field>
    )
  }
  if (field.type === 'textarea') {
    return (
      <Field label={field.label} required={required} error={error?.message}>
        <Textarea {...register(field.name, rules)} placeholder={field.placeholder} />
      </Field>
    )
  }
  return (
    <Field label={field.label} required={required} error={error?.message}>
      <Input type={field.type || 'text'} step={field.step} placeholder={field.placeholder} {...register(field.name, rules)} />
    </Field>
  )
}
