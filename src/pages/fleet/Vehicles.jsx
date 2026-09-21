import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, MoreHorizontal, Truck, CheckCircle2, Wrench, Fuel as FuelIcon } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, KPICard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { StatusBadge } from '../../components/ui/Badge'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { useDataTable } from '../../hooks/useDataTable'
import { fleetApi } from '../../api/assetApi'
import { formatCurrency, formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

const vehicleStatuses = ['active', 'maintenance']
const vehicleTypes = ['Material Transport', 'Site Visit Vehicle']
const fuelTypes = ['Diesel', 'Petrol', 'CNG', 'Electric']

export default function Vehicles() {
  const { can } = usePermissions()
  const allowCreate = can('fleet', 'create')
  const allowEdit = can('fleet', 'edit')
  const allowDelete = can('fleet', 'delete')
  const table = useDataTable(fleetApi.vehicles.list, { pageSize: 8, initialFilters: { status: 'all' } })
  const [summary, setSummary] = useState(null)
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fleetApi.summary().then(setSummary)
  }, [table.total])

  function openCreate() {
    reset({ regNo: '', model: '', type: vehicleTypes[0], driver: '', status: 'active', lastService: '', fuelType: fuelTypes[0] })
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
        await fleetApi.vehicles.create(values)
        toast.success('Vehicle added')
      } else {
        await fleetApi.vehicles.update(drawer.record.id, values)
        toast.success('Vehicle updated')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
      fleetApi.summary().then(setSummary)
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await fleetApi.vehicles.remove(confirm.record.id)
      toast.success('Vehicle deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
      fleetApi.summary().then(setSummary)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'regNo', header: 'Reg No', sortable: true, render: (v) => <span className="font-medium text-ink">{v.regNo}</span> },
    { key: 'model', header: 'Model', sortable: true },
    { key: 'type', header: 'Type' },
    { key: 'driver', header: 'Driver' },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
    { key: 'lastService', header: 'Last Service', render: (v) => formatDate(v.lastService) },
    { key: 'fuelType', header: 'Fuel Type' },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (v) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(v)}>Edit</DropdownItem>}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: v })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Vehicles"
        subtitle={`${table.total} vehicles in the fleet`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Vehicle</Button> : null}
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {!summary ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Vehicles" value={summary.total} icon={Truck} trend="neutral" accent="brand" />
              <KPICard label="Active" value={summary.active} icon={CheckCircle2} trend="up" accent="success" />
              <KPICard label="In Maintenance" value={summary.maintenance} icon={Wrench} trend={summary.maintenance > 0 ? 'down' : 'neutral'} accent="warning" />
              <KPICard label="Total Fuel Cost" value={formatCurrency(summary.fuelCost, { compact: true })} icon={FuelIcon} trend="neutral" accent="info" />
            </>
          )}
        </div>

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
            emptyState={{ title: 'No vehicles found', description: 'Add your first vehicle to get started.', action: allowCreate ? { label: 'New Vehicle', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => fleetApi.vehicles.remove(id))); toast.success(`${ids.length} vehicle(s) deleted`); setSelected([]); table.refresh(); fleetApi.summary().then(setSummary) } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search vehicles…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[140px]">
                  <option value="all">All Status</option>
                  {vehicleStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Vehicle' : 'Edit Vehicle'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Add Vehicle' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Registration No" required error={errors.regNo?.message}>
              <Input placeholder="MH-04-AB-2231" {...register('regNo', { required: 'Required' })} />
            </Field>
            <Field label="Model" required error={errors.model?.message}>
              <Input {...register('model', { required: 'Required' })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select {...register('type')}>
                {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Fuel Type">
              <Select {...register('fuelType')}>
                {fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Driver Name">
            <Input {...register('driver')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select {...register('status')}>
                {vehicleStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Last Service"><Input type="date" {...register('lastService')} /></Field>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this vehicle?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
