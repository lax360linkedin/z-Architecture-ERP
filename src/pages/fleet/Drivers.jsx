import { EntityListPage } from '../../components/patterns/EntityListPage'
import { StatusBadge } from '../../components/ui/Badge'
import { fleetApi } from '../../api/assetApi'
import { vehicles } from '../../data/fleet'

const driverStatuses = ['active', 'inactive']

export default function Drivers() {
  const columns = [
    { key: 'name', header: 'Name', sortable: true, render: (d) => <span className="font-medium text-ink">{d.name}</span> },
    { key: 'license', header: 'License No' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'vehicle', header: 'Assigned Vehicle', render: (d) => {
        const v = vehicles.find((x) => x.id === d.vehicle)
        return v ? `${v.regNo} · ${v.model}` : '—'
      },
    },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
  ]

  return (
    <EntityListPage
      permissionModule="fleet"
      title="Drivers"
      subtitle="Fleet drivers and their vehicle assignments"
      api={fleetApi.drivers}
      columns={columns}
      searchPlaceholder="Search drivers…"
      filters={[{ key: 'status', label: 'Status', options: driverStatuses }]}
      emptyStateTitle="No drivers found"
      emptyStateDescription="Add your first driver to get started."
      createLabel="New Driver"
      defaultValues={{ name: '', license: '', phone: '', vehicle: vehicles[0]?.id || '', status: 'active' }}
      formFields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'license', label: 'License No', required: true },
        { name: 'phone', label: 'Phone', required: true },
        { name: 'vehicle', label: 'Assigned Vehicle', type: 'select', options: vehicles.map((v) => ({ value: v.id, label: `${v.regNo} · ${v.model}` })) },
        { name: 'status', label: 'Status', type: 'select', options: driverStatuses },
      ]}
    />
  )
}
