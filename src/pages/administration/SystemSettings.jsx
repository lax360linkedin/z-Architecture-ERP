import { useState } from 'react'
import toast from 'react-hot-toast'
import { DatabaseBackup, ShieldCheck, Bell, Settings2, Save } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field, Select, Checkbox } from '../../components/ui/Input'
import { usePermissions } from '../../context/PermissionContext'

const NOTIFICATION_CATEGORIES = [
  { key: 'approvals', label: 'Approval requests', hint: 'Purchase orders, quotations, leave requests awaiting your action' },
  { key: 'projectUpdates', label: 'Project updates', hint: 'Milestones, status changes and site reports' },
  { key: 'financeAlerts', label: 'Finance alerts', hint: 'Overdue invoices and payment reminders' },
  { key: 'systemAnnouncements', label: 'System announcements', hint: 'Maintenance windows and product updates' },
]

export default function SystemSettings() {
  const { can } = usePermissions()
  const allowEdit = can('administration', 'systemSettings')
  const [general, setGeneral] = useState({ timezone: 'Asia/Kolkata (IST)', dateFormat: 'DD MMM YYYY', language: 'English (India)' })
  const [notifications, setNotifications] = useState({
    approvals: { email: true, push: true },
    projectUpdates: { email: true, push: false },
    financeAlerts: { email: true, push: true },
    systemAnnouncements: { email: false, push: false },
  })
  const [security, setSecurity] = useState({ sessionTimeout: '30', twoFactor: true })
  const [lastBackup] = useState('19 Sep 2024, 02:00 AM')
  const [backingUp, setBackingUp] = useState(false)

  function toggleNotification(key, channel) {
    if (!allowEdit) return
    setNotifications((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: !prev[key][channel] } }))
  }

  function runBackup() {
    if (!allowEdit) return
    setBackingUp(true)
    setTimeout(() => {
      setBackingUp(false)
      toast.success('Backup completed successfully')
    }, 900)
  }

  function saveAll() {
    if (!allowEdit) return
    toast.success('System settings saved')
  }

  return (
    <div>
      <PageHeader title="System Settings" subtitle="General preferences, notifications, security and backup configuration" />
      <PageBody className="flex flex-col gap-5">
        <Card>
          <CardHeader title="General" subtitle="Regional and display preferences" action={<Settings2 className="h-4 w-4 text-ink-faint" />} />
          <fieldset disabled={!allowEdit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Timezone">
              <Select value={general.timezone} onChange={(e) => setGeneral((p) => ({ ...p, timezone: e.target.value }))}>
                <option>Asia/Kolkata (IST)</option>
                <option>Asia/Dubai (GST)</option>
                <option>UTC</option>
              </Select>
            </Field>
            <Field label="Date Format">
              <Select value={general.dateFormat} onChange={(e) => setGeneral((p) => ({ ...p, dateFormat: e.target.value }))}>
                <option>DD MMM YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
              </Select>
            </Field>
            <Field label="Language">
              <Select value={general.language} onChange={(e) => setGeneral((p) => ({ ...p, language: e.target.value }))}>
                <option>English (India)</option>
                <option>English (US)</option>
                <option>Hindi</option>
              </Select>
            </Field>
          </fieldset>
        </Card>

        <Card>
          <CardHeader title="Notifications" subtitle="Choose how you want to be notified for each category" action={<Bell className="h-4 w-4 text-ink-faint" />} />
          <fieldset disabled={!allowEdit} className="flex flex-col divide-y divide-border-subtle">
            {NOTIFICATION_CATEGORIES.map((cat) => (
              <div key={cat.key} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{cat.label}</p>
                  <p className="text-xs text-ink-faint">{cat.hint}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Checkbox label="Email" checked={notifications[cat.key].email} onChange={() => toggleNotification(cat.key, 'email')} />
                  <Checkbox label="Push" checked={notifications[cat.key].push} onChange={() => toggleNotification(cat.key, 'push')} />
                </div>
              </div>
            ))}
          </fieldset>
        </Card>

        <Card>
          <CardHeader title="Security" subtitle="Session and authentication controls" action={<ShieldCheck className="h-4 w-4 text-ink-faint" />} />
          <fieldset disabled={!allowEdit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Session Timeout" hint="Automatically sign out after this period of inactivity">
              <Select value={security.sessionTimeout} onChange={(e) => setSecurity((p) => ({ ...p, sessionTimeout: e.target.value }))}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="240">4 hours</option>
              </Select>
            </Field>
            <div className="flex items-end pb-2.5">
              <Checkbox
                label="Require Two-Factor Authentication for all users"
                checked={security.twoFactor}
                onChange={() => setSecurity((p) => ({ ...p, twoFactor: !p.twoFactor }))}
              />
            </div>
          </fieldset>
        </Card>

        <Card>
          <CardHeader title="Data & Backup" subtitle="Manage backups of your organization's data" action={<DatabaseBackup className="h-4 w-4 text-ink-faint" />} />
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-ink">Last backup completed</p>
              <p className="text-xs text-ink-faint">{lastBackup}</p>
            </div>
            {allowEdit && (
              <Button variant="secondary" icon={DatabaseBackup} loading={backingUp} onClick={runBackup}>
                Run Backup Now
              </Button>
            )}
          </div>
        </Card>

        {allowEdit && (
          <div className="flex justify-end">
            <Button icon={Save} onClick={saveAll}>Save Settings</Button>
          </div>
        )}
      </PageBody>
    </div>
  )
}
