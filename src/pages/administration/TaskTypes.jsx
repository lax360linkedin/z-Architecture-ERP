import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Tag } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { usePermissions } from '../../context/PermissionContext'
import { TASK_TYPES } from '../../data/tasks'

export default function TaskTypes() {
  const { can } = usePermissions()
  const allowManage = can('administration', 'edit') || can('tasks', 'create')
  const [types, setTypes] = useState([...TASK_TYPES])
  const [newType, setNewType] = useState('')

  function addType() {
    const name = newType.trim()
    if (!name) return
    if (types.some((t) => t.toLowerCase() === name.toLowerCase())) {
      toast.error('That task type already exists')
      return
    }
    TASK_TYPES.push(name)
    setTypes([...TASK_TYPES])
    setNewType('')
    toast.success(`"${name}" added as a task type`)
  }

  function removeType(name) {
    const idx = TASK_TYPES.indexOf(name)
    if (idx > -1) TASK_TYPES.splice(idx, 1)
    setTypes([...TASK_TYPES])
    toast.success(`"${name}" removed`)
  }

  return (
    <div>
      <PageHeader title="Task Types" subtitle="Manage the task categories available across the ERP" />
      <PageBody className="flex flex-col gap-4">
        {allowManage && (
          <Card className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">New task type</label>
              <Input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g. Compliance Task" onKeyDown={(e) => e.key === 'Enter' && addType()} />
            </div>
            <Button icon={Plus} onClick={addType}>Add Type</Button>
          </Card>
        )}
        <Card padded={false}>
          {types.length === 0 ? (
            <EmptyState title="No task types configured" />
          ) : (
            <div className="divide-y divide-border-subtle">
              {types.map((t) => (
                <div key={t} className="flex items-center justify-between px-5 py-3">
                  <span className="flex items-center gap-2.5 text-sm font-medium text-ink"><Tag className="h-4 w-4 text-ink-faint" />{t}</span>
                  <div className="flex items-center gap-3">
                    <Badge>Active</Badge>
                    {allowManage && (
                      <button onClick={() => removeType(t)} className="rounded-md p-1.5 text-ink-faint hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </PageBody>
    </div>
  )
}
