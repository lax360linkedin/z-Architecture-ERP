import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, MoreHorizontal, UserCheck, UserX } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { useDataTable } from '../../hooks/useDataTable'
import { adminApi } from '../../api/adminApi'
import { ROLES } from '../../utils/constants'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'
import { useAuth } from '../../context/AuthContext'
import { logAudit } from '../../api/auditLogApi'

export default function AdminUsers() {
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowCreate = can('administration', 'create')
  const allowEdit = can('administration', 'edit')
  const allowDelete = can('administration', 'delete')
  const table = useDataTable(adminApi.users.list, { pageSize: 8, initialFilters: { role: 'all', status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ name: '', email: '', role: 'Employee', status: 'active' })
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
        await adminApi.users.create({ ...values, lastLogin: new Date().toISOString() })
        toast.success('User created successfully')
      } else {
        await adminApi.users.update(drawer.record.id, values)
        toast.success('User updated successfully')
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
      await adminApi.users.remove(confirm.record.id)
      toast.success('User deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(record) {
    const nextStatus = record.status === 'active' ? 'inactive' : 'active'
    try {
      await adminApi.users.update(record.id, { status: nextStatus })
      logAudit({
        user,
        action: nextStatus === 'inactive' ? 'Deactivated user account' : 'Activated user account',
        module: 'Administration',
        record: record.id,
        change: `status: ${record.status} → ${nextStatus}`,
      })
      toast.success(nextStatus === 'inactive' ? 'User deactivated — they can no longer sign in.' : 'User activated.')
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => <Badge color="brand">{r.role}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'lastLogin', header: 'Last Login', sortable: true, render: (r) => formatDate(r.lastLogin, { withTime: true }) },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (r) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-52" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(r)}>Edit</DropdownItem>}
                {allowEdit && (
                  r.status === 'active'
                    ? <DropdownItem icon={UserX} onClick={() => toggleStatus(r)}>Deactivate account</DropdownItem>
                    : <DropdownItem icon={UserCheck} onClick={() => toggleStatus(r)}>Activate account</DropdownItem>
                )}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: r })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${table.total} system users`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New User</Button> : null}
      />
      <PageBody>
        <Card padded={false}>
          <DataTable
            columns={columns}
            data={table.items}
            loading={table.loading}
            error={table.error}
            onRetry={table.refresh}
            selectable={allowDelete}
            selected={selected}
            onSelectedChange={setSelected}
            sort={table.sort}
            onSortChange={table.toggleSort}
            onRowClick={allowEdit ? openEdit : undefined}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No users found', description: 'Add your first system user.', action: allowCreate ? { label: 'New User', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => adminApi.users.remove(id))); toast.success(`${ids.length} user(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search users…" className="w-full max-w-xs" />
                <Select value={table.filters.role} onChange={(e) => table.setFilters((p) => ({ ...p, role: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Roles</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New User' : 'Edit User'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create User' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Full Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <Input type="email" {...register('email', { required: 'Email is required' })} />
          </Field>
          <Field label="Role" required error={errors.role?.message}>
            <Select {...register('role', { required: true })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Status" required error={errors.status?.message}>
            <Select {...register('status', { required: true })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this user?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
