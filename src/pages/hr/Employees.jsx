import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { useDataTable } from '../../hooks/useDataTable'
import { hrApi } from '../../api/hrApi'
import { employees, getEmployeeName } from '../../data/employees'
import { DEPARTMENTS, ROLES } from '../../utils/constants'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function Employees() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const allowCreate = can('hr', 'create')
  const allowEdit = can('hr', 'edit')
  const allowDelete = can('hr', 'delete')
  const table = useDataTable(hrApi.employees.list, { pageSize: 10, initialFilters: { department: 'all', status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ department: DEPARTMENTS[0], role: ROLES[ROLES.length - 1], status: 'active', joiningDate: new Date().toISOString().slice(0, 10) })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, manager: values.manager || null }
      if (drawer.mode === 'create') {
        await hrApi.employees.create(payload)
        toast.success('Employee added successfully')
      } else {
        await hrApi.employees.update(drawer.record.id, payload)
        toast.success('Employee updated successfully')
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
      await hrApi.employees.remove(confirm.record.id)
      toast.success('Employee removed')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'name', header: 'Employee', sortable: true, render: (e) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={e.name} size="sm" />
          <div>
            <p className="font-medium text-ink">{e.name}</p>
            <p className="text-xs text-ink-faint">{e.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'designation', header: 'Designation', sortable: true },
    { key: 'manager', header: 'Manager', render: (e) => (e.manager ? getEmployeeName(e.manager) : '—') },
    { key: 'joiningDate', header: 'Joining Date', sortable: true, render: (e) => formatDate(e.joiningDate) },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} /> },
    {
      key: '__actions', header: '', className: 'text-right', render: (e) => (
        <div onClick={(ev) => ev.stopPropagation()} className="flex justify-end">
          <Dropdown align="right" width="w-48" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
            <DropdownItem icon={Eye} onClick={() => navigate(`/hr/employees/${e.id}`)}>View profile</DropdownItem>
            {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(e)}>Edit</DropdownItem>}
            {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: e })}>Delete</DropdownItem>}
          </Dropdown>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${table.total} employees on record`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Employee</Button> : null}
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
            onRowClick={(row) => navigate(`/hr/employees/${row.id}`)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No employees found', description: 'Add your first employee to build your team roster.', action: allowCreate ? { label: 'New Employee', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => hrApi.employees.remove(id))); toast.success(`${ids.length} employee(s) removed`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search employees…" className="w-full max-w-xs" />
                <Select value={table.filters.department} onChange={(e) => table.setFilters((p) => ({ ...p, department: e.target.value }))} className="w-auto min-w-[160px]">
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Employee' : 'Edit Employee'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Add Employee' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Full name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </Field>
          <Field label="Designation" required error={errors.designation?.message}>
            <Input {...register('designation', { required: 'Designation is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <Select {...register('department')}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="Role">
              <Select {...register('role')}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required error={errors.email?.message}>
              <Input type="email" {...register('email', { required: 'Email is required' })} />
            </Field>
            <Field label="Phone" required error={errors.phone?.message}>
              <Input {...register('phone', { required: 'Phone is required' })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Joining Date">
              <Input type="date" {...register('joiningDate')} />
            </Field>
            <Field label="Location">
              <Input {...register('location')} placeholder="City" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Manager">
              <Select {...register('manager')}>
                <option value="">No manager</option>
                {employees.filter((e) => e.id !== drawer.record?.id).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select {...register('status')}>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
              </Select>
            </Field>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Remove this employee?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
