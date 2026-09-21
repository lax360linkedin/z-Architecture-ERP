import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, MoreHorizontal, Fuel as FuelIcon, Droplets, IndianRupee } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, KPICard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { useDataTable } from '../../hooks/useDataTable'
import { fleetApi } from '../../api/assetApi'
import { vehicles } from '../../data/fleet'
import { formatCurrency, formatDate, formatNumber } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function Fuel() {
  const { can } = usePermissions()
  const allowCreate = can('fleet', 'create')
  const allowEdit = can('fleet', 'edit')
  const allowDelete = can('fleet', 'delete')
  const table = useDataTable(fleetApi.fuelLogs.list, { pageSize: 8 })
  const [allLogs, setAllLogs] = useState(null)
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function loadAll() {
    fleetApi.fuelLogs.all().then(setAllLogs)
  }
  useEffect(loadAll, [table.total])

  const totalCost = allLogs ? allLogs.reduce((s, f) => s + f.cost, 0) : 0
  const totalLitres = allLogs ? allLogs.reduce((s, f) => s + f.litres, 0) : 0
  const avgCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0

  function openCreate() {
    reset({ vehicle: vehicles[0]?.id || '', date: '', litres: '', cost: '', odometer: '' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, litres: Number(values.litres) || 0, cost: Number(values.cost) || 0, odometer: Number(values.odometer) || 0 }
      if (drawer.mode === 'create') {
        await fleetApi.fuelLogs.create(payload)
        toast.success('Fuel log added')
      } else {
        await fleetApi.fuelLogs.update(drawer.record.id, payload)
        toast.success('Fuel log updated')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
      loadAll()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await fleetApi.fuelLogs.remove(confirm.record.id)
      toast.success('Fuel log deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
      loadAll()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'vehicle', header: 'Vehicle', render: (f) => vehicles.find((v) => v.id === f.vehicle)?.regNo || f.vehicle },
    { key: 'date', header: 'Date', sortable: true, render: (f) => formatDate(f.date) },
    { key: 'litres', header: 'Litres', sortable: true, render: (f) => `${formatNumber(f.litres)} L` },
    { key: 'cost', header: 'Cost', sortable: true, render: (f) => formatCurrency(f.cost) },
    { key: 'odometer', header: 'Odometer', sortable: true, render: (f) => `${formatNumber(f.odometer)} km` },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (f) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(f)}>Edit</DropdownItem>}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: f })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Fuel Logs"
        subtitle={`${table.total} fuel entries recorded`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Fuel Log</Button> : null}
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {!allLogs ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Fuel Cost" value={formatCurrency(totalCost, { compact: true })} icon={IndianRupee} trend="neutral" accent="brand" />
              <KPICard label="Total Litres" value={`${formatNumber(totalLitres)} L`} icon={Droplets} trend="neutral" accent="info" />
              <KPICard label="Avg. Cost / Litre" value={formatCurrency(avgCostPerLitre)} icon={FuelIcon} trend="neutral" accent="warning" />
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
            emptyState={{ title: 'No fuel logs found', description: 'Log your first fuel entry to get started.', action: allowCreate ? { label: 'New Fuel Log', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => fleetApi.fuelLogs.remove(id))); toast.success(`${ids.length} log(s) deleted`); setSelected([]); table.refresh(); loadAll() } }] : []}
            toolbar={<SearchInput value={table.query} onChange={table.setQuery} placeholder="Search by vehicle…" className="w-full max-w-xs" />}
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Fuel Log' : 'Edit Fuel Log'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Add Log' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Vehicle">
            <Select {...register('vehicle')}>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo} · {v.model}</option>)}
            </Select>
          </Field>
          <Field label="Date" required error={errors.date?.message}>
            <Input type="date" {...register('date', { required: 'Required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Litres"><Input type="number" {...register('litres')} /></Field>
            <Field label="Cost (₹)"><Input type="number" {...register('cost')} /></Field>
          </div>
          <Field label="Odometer (km)"><Input type="number" {...register('odometer')} /></Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this fuel log?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
