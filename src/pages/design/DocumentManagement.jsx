import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FileText, FileSpreadsheet, FileImage, FileType2, DraftingCompass, UploadCloud, Lock, Globe, FolderOpen } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { Pills } from '../../components/ui/Tabs'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import { FileUpload } from '../../components/ui/FileUpload'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { designApi } from '../../api/designApi'
import { documentFolders } from '../../data/designs'
import { projects, getProjectName } from '../../data/projects'
import { employees, getEmployeeName } from '../../data/employees'
import { DEPARTMENTS } from '../../utils/constants'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

const TYPE_ICONS = {
  PDF: FileText,
  DWG: DraftingCompass,
  DOCX: FileType2,
  XLSX: FileSpreadsheet,
  JPG: FileImage,
  PNG: FileImage,
}

const TYPE_OPTIONS = ['PDF', 'DWG', 'DOCX', 'XLSX', 'JPG', 'PNG']

export default function DocumentManagement() {
  const { can } = usePermissions()
  const allowUpload = can('documents', 'upload')
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [folder, setFolder] = useState('all')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ project: 'all', type: 'all', department: 'all', uploadedBy: 'all' })
  const [drawer, setDrawer] = useState(false)
  const [detail, setDetail] = useState(null)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { project: projects[0]?.id, folder: documentFolders[0], department: DEPARTMENTS[0], access: 'Internal', name: '', type: 'PDF' },
  })

  async function load() {
    setLoading(true)
    const all = await designApi.documents.all()
    setDocuments(all)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return documents.filter((d) => {
      if (folder !== 'all' && d.folder !== folder) return false
      if (filters.project !== 'all' && d.project !== filters.project) return false
      if (filters.type !== 'all' && d.type !== filters.type) return false
      if (filters.department !== 'all' && d.department !== filters.department) return false
      if (filters.uploadedBy !== 'all' && d.uploadedBy !== filters.uploadedBy) return false
      if (q && !d.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [documents, folder, query, filters])

  function openCreate() {
    reset({ project: projects[0]?.id, folder: documentFolders[0], department: DEPARTMENTS[0], access: 'Internal', name: '', type: 'PDF' })
    setDrawer(true)
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      await designApi.documents.create({
        ...values,
        size: `${(Math.random() * 10 + 0.5).toFixed(1)} MB`,
        uploadedBy: 'EMP-023',
        date: new Date().toISOString().slice(0, 10),
        version: '1.0',
      })
      toast.success('Document uploaded successfully')
      setDrawer(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to upload document')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Document Management"
        subtitle={`${documents.length} documents across the organization`}
        actions={allowUpload ? <Button icon={UploadCloud} onClick={openCreate}>Upload Document</Button> : null}
      />
      <PageBody className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <Pills
            value={folder}
            onChange={setFolder}
            options={[{ value: 'all', label: 'All Folders' }, ...documentFolders.map((f) => ({ value: f, label: f }))]}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="Search documents…" className="w-full max-w-xs" />
          <Select value={filters.project} onChange={(e) => setFilters((p) => ({ ...p, project: e.target.value }))} className="w-auto min-w-[160px]">
            <option value="all">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))} className="w-auto min-w-[120px]">
            <option value="all">All Types</option>
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={filters.department} onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))} className="w-auto min-w-[160px]">
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select value={filters.uploadedBy} onChange={(e) => setFilters((p) => ({ ...p, uploadedBy: e.target.value }))} className="w-auto min-w-[160px]">
            <option value="all">All Uploaders</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card><EmptyState icon={FolderOpen} title="No documents found" description="Try adjusting your filters, or upload a new document." action={allowUpload ? { label: 'Upload Document', icon: UploadCloud, onClick: openCreate } : undefined} /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d) => {
              const Icon = TYPE_ICONS[d.type] || FileText
              return (
                <Card key={d.id} className="flex cursor-pointer flex-col gap-3" onClick={() => setDetail(d)}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <Badge color={d.access === 'Restricted' ? 'danger' : 'neutral'}>
                      {d.access === 'Restricted' ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      {d.access}
                    </Badge>
                  </div>
                  <div>
                    <p className="line-clamp-2 text-sm font-medium text-ink">{d.name}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{d.size} · v{d.version}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-2 text-xs text-ink-muted">
                    <span>{getEmployeeName(d.uploadedBy)}</span>
                    <span>{formatDate(d.date)}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </PageBody>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Upload Document"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>Upload Document</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FileUpload hint="PDF, DWG, DOCX, XLSX, JPG or PNG up to 25MB" />
          <Field label="Document Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Document name is required' })} placeholder="e.g. Site Plan v2.dwg" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="File Type">
              <Select {...register('type')}>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Access Level">
              <Select {...register('access')}>
                <option value="Internal">Internal</option>
                <option value="Restricted">Restricted</option>
              </Select>
            </Field>
          </div>
          <Field label="Project">
            <Select {...register('project')}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Folder">
              <Select {...register('folder')}>
                {documentFolders.map((f) => <option key={f} value={f}>{f}</option>)}
              </Select>
            </Field>
            <Field label="Department">
              <Select {...register('department')}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
          </div>
        </form>
      </Drawer>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name} size="sm">
        {detail && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-ink-faint">Project</span><span className="font-medium text-ink">{getProjectName(detail.project)}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Folder</span><span className="font-medium text-ink">{detail.folder}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Type</span><span className="font-medium text-ink">{detail.type}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Size</span><span className="font-medium text-ink">{detail.size}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Version</span><span className="font-medium text-ink">v{detail.version}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Department</span><span className="font-medium text-ink">{detail.department}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Access</span><Badge color={detail.access === 'Restricted' ? 'danger' : 'neutral'}>{detail.access}</Badge></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Uploaded By</span><span className="font-medium text-ink">{getEmployeeName(detail.uploadedBy)}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-faint">Uploaded On</span><span className="font-medium text-ink">{formatDate(detail.date)}</span></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
