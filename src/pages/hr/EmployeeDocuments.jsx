import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FileText, Download, Plus } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { Field, Input, Select } from '../../components/ui/Input'
import { FileUpload } from '../../components/ui/FileUpload'
import { EmptyState } from '../../components/ui/EmptyState'
import { documents, documentFolders } from '../../data/designs'
import { getEmployeeName } from '../../data/employees'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function EmployeeDocuments() {
  const { can } = usePermissions()
  const allowUpload = can('hr', 'edit')
  const [drawer, setDrawer] = useState(false)
  const [name, setName] = useState('')
  const [folder, setFolder] = useState(documentFolders[0])

  const hrDocs = useMemo(
    () => documents.filter((d) => d.department === 'Human Resources' || d.department === 'Administration'),
    []
  )

  function handleUpload() {
    toast.success(`${name || 'Document'} uploaded successfully`)
    setDrawer(false)
    setName('')
  }

  return (
    <div>
      <PageHeader
        title="Employee Documents"
        subtitle={`${hrDocs.length} HR & administrative document${hrDocs.length !== 1 ? 's' : ''} on file`}
        actions={allowUpload ? <Button icon={Plus} onClick={() => setDrawer(true)}>Upload Document</Button> : null}
      />
      <PageBody>
        {hrDocs.length === 0 ? (
          <Card>
            <EmptyState
              title="No HR documents uploaded yet"
              description="Offer letters, policy documents, ID proofs and contracts will appear here once uploaded."
              action={allowUpload ? { label: 'Upload Document', icon: Plus, onClick: () => setDrawer(true) } : undefined}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hrDocs.map((d) => (
              <Card key={d.id} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                  <p className="text-xs text-ink-faint">{d.size} · {d.folder}</p>
                  <p className="text-xs text-ink-faint">Uploaded by {getEmployeeName(d.uploadedBy)} · {formatDate(d.date)}</p>
                </div>
                <Download className="h-4 w-4 shrink-0 cursor-pointer text-ink-faint hover:text-ink" />
              </Card>
            ))}
          </div>
        )}
      </PageBody>

      <Drawer
        open={drawer && allowUpload}
        onClose={() => setDrawer(false)}
        title="Upload Document"
        footer={<><Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button><Button onClick={handleUpload}>Upload</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Field label="Document name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Offer Letter - Employee Name.pdf" />
          </Field>
          <Field label="Folder">
            <Select value={folder} onChange={(e) => setFolder(e.target.value)}>
              {documentFolders.map((f) => <option key={f} value={f}>{f}</option>)}
            </Select>
          </Field>
          <FileUpload multiple={false} hint="PDF, DOCX or JPG up to 10MB" />
        </div>
      </Drawer>
    </div>
  )
}
