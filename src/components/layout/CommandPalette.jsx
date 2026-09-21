import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, FolderPlus, UserPlus, FileText, ListPlus, UploadCloud, UserRoundPlus,
  ShoppingCart, CornerDownLeft, Command,
} from 'lucide-react'
import { flatNavItems } from '../../routes/navConfig'
import { useApp } from '../../context/AppContext'
import { customers } from '../../data/customers'
import { projects } from '../../data/projects'
import { drawings } from '../../data/drawings'
import { invoices } from '../../data/invoices'
import { employees } from '../../data/employees'
import { vendors } from '../../data/vendors'
import { leads } from '../../data/leads'
import { classNames } from '../../utils/format'

const quickActions = [
  { label: 'Create Project', icon: FolderPlus, path: '/projects?new=1' },
  { label: 'Create Lead', icon: UserPlus, path: '/crm/leads?new=1' },
  { label: 'Create Invoice', icon: FileText, path: '/billing/invoices?new=1' },
  { label: 'Create Task', icon: ListPlus, path: '/tasks/my-tasks?new=1' },
  { label: 'Upload Drawing', icon: UploadCloud, path: '/design/drawings?new=1' },
  { label: 'Add Employee', icon: UserRoundPlus, path: '/hr/employees?new=1' },
  { label: 'New Purchase Request', icon: ShoppingCart, path: '/procurement/requests?new=1' },
]

function buildSearchIndex() {
  return [
    ...customers.map((c) => ({ group: 'Customers', label: c.name, path: `/crm/customers/${c.id}` })),
    ...leads.map((l) => ({ group: 'Leads', label: l.name, path: `/crm/leads` })),
    ...projects.map((p) => ({ group: 'Projects', label: p.name, path: `/projects/${p.id}` })),
    ...drawings.map((d) => ({ group: 'Drawings', label: `${d.number} — ${d.name}`, path: `/design/drawings` })),
    ...invoices.map((i) => ({ group: 'Invoices', label: i.id, path: `/billing/invoices` })),
    ...employees.map((e) => ({ group: 'Employees', label: e.name, path: `/hr/employees` })),
    ...vendors.map((v) => ({ group: 'Vendors', label: v.name, path: `/vendors` })),
  ]
}

const searchIndex = buildSearchIndex()

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setCommandPaletteOpen])

  useEffect(() => {
    if (!commandPaletteOpen) setQuery('')
  }, [commandPaletteOpen])

  const results = useMemo(() => {
    if (!query) return { nav: flatNavItems.slice(0, 6), actions: quickActions, data: [] }
    const q = query.toLowerCase()
    return {
      nav: flatNavItems.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 6),
      actions: quickActions.filter((a) => a.label.toLowerCase().includes(q)),
      data: searchIndex.filter((d) => d.label.toLowerCase().includes(q)).slice(0, 8),
    }
  }, [query])

  function go(path) {
    navigate(path)
    setCommandPaletteOpen(false)
  }

  if (!commandPaletteOpen) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setCommandPaletteOpen(false)} />
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -8 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-popover"
        >
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4 w-4 text-ink-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, customers, drawings, invoices… or run a command"
              className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
            />
            <kbd className="hidden items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] text-ink-faint sm:flex">esc</kbd>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.actions.length > 0 && (
              <Section title="Quick Actions">
                {results.actions.map((a) => (
                  <Row key={a.label} icon={a.icon} label={a.label} onClick={() => go(a.path)} />
                ))}
              </Section>
            )}
            {results.nav.length > 0 && (
              <Section title="Go to">
                {results.nav.map((n) => (
                  <Row key={n.path} icon={n.icon || Command} label={n.label} onClick={() => go(n.path)} />
                ))}
              </Section>
            )}
            {results.data.length > 0 && (
              <Section title="Records">
                {results.data.map((d, i) => (
                  <Row key={i} icon={Search} label={d.label} sub={d.group} onClick={() => go(d.path)} />
                ))}
              </Section>
            )}
            {query && results.nav.length === 0 && results.actions.length === 0 && results.data.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-ink-muted">No results for “{query}”</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-1">
      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{title}</p>
      {children}
    </div>
  )
}

function Row({ icon: Icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className={classNames('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-surface-subtle')}
    >
      <Icon className="h-4 w-4 shrink-0 text-ink-faint" />
      <span className="flex-1 truncate">{label}</span>
      {sub && <span className="shrink-0 text-xs text-ink-faint">{sub}</span>}
      <CornerDownLeft className="h-3 w-3 shrink-0 text-ink-faint opacity-0 group-hover:opacity-100" />
    </button>
  )
}
