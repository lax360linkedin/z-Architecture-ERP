import { Menu, Search, Sun, Moon, HelpCircle, ChevronDown, LogOut, Settings, FlaskConical, Building2, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Dropdown, DropdownItem, DropdownSeparator } from '../ui/Dropdown'
import { NotificationCenter } from './NotificationCenter'
import { classNames } from '../../utils/format'

export function Header() {
  const { setMobileNavOpen, currentBranch, setCurrentBranch, branches, setCommandPaletteOpen } = useApp()
  const { theme, toggleTheme } = useTheme()
  const { user, logout, loginAs, demoAccounts } = useAuth()
  const { can } = usePermissions()
  const navigate = useNavigate()

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface-raised px-4 sm:px-6">
      <button onClick={() => setMobileNavOpen(true)} className="rounded-md p-2 text-ink-muted hover:bg-surface-subtle lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex h-9.5 w-full max-w-md items-center gap-2.5 rounded-lg border border-border bg-surface-subtle px-3 text-sm text-ink-faint hover:border-ink-faint/40 focus-ring"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search projects, customers, invoices…</span>
        <span className="sm:hidden">Search…</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium sm:flex">
          Ctrl K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Dropdown
          align="right"
          trigger={
            <button className="hidden h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-ink-muted hover:bg-surface-subtle md:flex">
              <Building2 className="h-4 w-4" />
              {currentBranch.name}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          }
        >
          {branches.map((b) => (
            <DropdownItem key={b.id} onClick={() => setCurrentBranch(b)}>
              <span className="flex flex-1 items-center justify-between">
                {b.name}
                {b.id === currentBranch.id && <Check className="h-3.5 w-3.5 text-brand-600" />}
              </span>
            </DropdownItem>
          ))}
        </Dropdown>

        <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-subtle hover:text-ink focus-ring">
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <button className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-subtle hover:text-ink focus-ring sm:flex">
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        <NotificationCenter />

        <Dropdown
          align="right"
          width="w-72"
          trigger={
            <button className="ml-1 flex items-center gap-2 rounded-lg p-1 hover:bg-surface-subtle">
              <Avatar name={user?.name} size="sm" />
              <ChevronDown className="hidden h-3.5 w-3.5 text-ink-faint md:block" />
            </button>
          }
        >
          {({ close }) => (
            <>
              <div className="flex items-center gap-3 px-2.5 py-2">
                <Avatar name={user?.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                  <p className="truncate text-xs text-ink-faint">{user?.designation} · {user?.role}</p>
                </div>
              </div>
              <DropdownSeparator />
              {can('administration', 'systemSettings') && (
                <DropdownItem icon={Settings} onClick={() => { navigate('/administration/system-settings'); close() }}>
                  Settings
                </DropdownItem>
              )}
              <DropdownSeparator />
              <div className="flex items-center gap-1.5 px-2.5 py-1">
                <FlaskConical className="h-3 w-3 text-amber-500" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Development / Demo Mode</p>
              </div>
              <p className="px-2.5 pb-1 text-[11px] text-ink-faint">Switch role to preview access — remove before connecting a real backend.</p>
              <div className="max-h-48 overflow-y-auto">
                {demoAccounts.map((u) => (
                  <DropdownItem key={u.id} disabled={u.status === 'inactive'} onClick={() => u.status !== 'inactive' && (loginAs(u.id), close())}>
                    <span className="flex flex-1 items-center justify-between">
                      <span className={classNames('truncate', u.status === 'inactive' && 'text-ink-faint line-through')}>{u.name} · {u.role}</span>
                      {u.id === user?.id && <Check className="h-3.5 w-3.5 shrink-0 text-brand-600" />}
                      {u.status === 'inactive' && <Badge color="danger" className="ml-1.5 shrink-0 text-[9px]">Disabled</Badge>}
                    </span>
                  </DropdownItem>
                ))}
              </div>
              <DropdownSeparator />
              <DropdownItem icon={LogOut} danger onClick={() => { logout(); navigate('/login'); close() }}>
                Sign out
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  )
}
