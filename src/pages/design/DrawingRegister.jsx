import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2, UploadCloud } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { FileUpload } from '../../components/ui/FileUpload'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { useDataTable } from '../../hooks/useDataTable'
import { designApi } from '../../api/designApi'
import { drawingCategories } from '../../data/drawings'
import { projects, getProjectName } from '../../data/projects'
import { employees, getEmployeeName } from '../../data/employees'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function DrawingRegister() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const allowUpload = can('design', 'upload')
  const allowDelete = can('design', 'delete')
  const table = useDataTable(designApi.drawings.list, { pageSize: 8, initialFilters: { category: 'all', status: 'all', project: 'all' } })
  const [drawer, setDrawer] = useState(false)
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { number: '', name: '', project: projects[0]?.id, category: drawingCategories[0], preparedBy: employees[0]?.id },
  })

  function openCreate() {
    reset({ number: '', name: '', project: projects[0]?.id, category: drawingCategories[0], preparedBy: employees[0]?.id })
    setDrawer(true)
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      await designApi.drawings.create({
        ...values,
        revision: 'Rev 00',
        checkedBy: null,
        approvedBy: null,
        status: 'draft',
        updatedDate: new Date().toISOString().slice(0, 10),
        revisions: [{ rev: 'Rev 00', date: new Date().toISOString().slice(0, 10), note: 'Initial Submission' }],
      })
      toast.success('Drawing uploaded successfully')
      setDrawer(false)
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Failed to upload drawing')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'number', header: 'Drawing Number', sortable: true, render: (d) => <span className="font-medium text-ink">{d.number}</span> },
    { key: 'name', header: 'Drawing Name', sortable: true },
    { key: 'project', header: 'Project', render: (d) => getProjectName(d.project) },
    { key: 'category', header: 'Category', render: (d) => <Badge>{d.category}</Badge> },
    { key: 'revision', header: 'Revision', render: (d) => <span className="font-medium text-ink">{d.revision}</span> },
    { key: 'preparedBy', header: 'Prepared By', render: (d) => (d.preparedBy ? getEmployeeName(d.preparedBy) : '—') },
    { key: 'checkedBy', header: 'Checked By', render: (d) => (d.checkedBy ? getEmployeeName(d.checkedBy) : '—') },
    { key: 'approvedBy', header: 'Approved By', render: (d) => (d.approvedBy ? getEmployeeName(d.approvedBy) : '—') },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    { key: 'updatedDate', header: 'Updated', sortable: true, render: (d) => formatDate(d.updatedDate) },
  ]

  return (
    <div>
      <PageHeader
        title="Drawing Register"
        subtitle={`${table.total} drawings registered`}
        actions={allowUpload ? <Button icon={UploadCloud} onClick={openCreate}>Upload Drawing</Button> : undefined}
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
            onRowClick={(row) => navigate(`/design/drawings/${row.id}`)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No drawings found', description: 'Upload your first drawing to build the register.', action: allowUpload ? { label: 'Upload Drawing', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => designApi.drawings.remove(id))); toast.success(`${ids.length} drawing(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search drawings…" className="w-full max-w-xs" />
                <Select value={table.filters.category} onChange={(e) => table.setFilters((p) => ({ ...p, category: e.target.value }))} className="w-auto min-w-[140px]">
                  <option value="all">All Categories</option>
                  {drawingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[140px]">
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="under-review">Under Review</option>
                  <option value="approved">Approved</option>
                </Select>
                <Select value={table.filters.project} onChange={(e) => table.setFilters((p) => ({ ...p, project: e.target.value }))} className="w-auto min-w-[160px]">
                  <option value="all">All Projects</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Upload Drawing"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>Upload Drawing</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FileUpload hint="PDF, DWG or DXF up to 25MB" />
          <Field label="Drawing Number" required error={errors.number?.message}>
            <Input {...register('number', { required: 'Drawing number is required' })} placeholder="LAX-XXX-A-101" />
          </Field>
          <Field label="Drawing Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Drawing name is required' })} placeholder="Ground Floor Plan" />
          </Field>
          <Field label="Project" required>
            <Select {...register('project', { required: true })}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Category" required>
            <Select {...register('category', { required: true })}>
              {drawingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Prepared By" required>
            <Select {...register('preparedBy', { required: true })}>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </Field>
        </form>
      </Drawer>
    </div>
  )
}
