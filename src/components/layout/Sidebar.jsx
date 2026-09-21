import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { navConfig } from '../../routes/navConfig'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { classNames } from '../../utils/format'
import { Logo } from './Logo'
import { Tooltip } from '../ui/Dropdown'

// Filters the nav tree down to what the current user may view. A group with
// a `module` is dropped entirely if the user lacks `<module>.view`; a child
// with its own `module` override (e.g. HR -> Payroll) is checked separately
// so a group can stay visible while one restricted child inside it is hidden.
function useVisibleNav() {
  const { can } = usePermissions()
  return navConfig.reduce((acc, item) => {
    if (item.module && !can(item.module, 'view')) return acc
    if (item.children) {
      const children = item.children.filter((child) => !child.module || can(child.module, 'view'))
      if (children.length === 0) return acc
      acc.push({ ...item, children })
    } else {
      acc.push(item)
    }
    return acc
  }, [])
}

function isChildActive(item, pathname) {
  if (!item.children) return pathname === item.path
  return item.children.some((c) => pathname === c.path || pathname.startsWith(c.path + '/'))
}

function NavGroup({ item, collapsed }) {
  const { pathname } = useLocation()
  const active = isChildActive(item, pathname)
  const [open, setOpen] = useState(active)

  useEffect(() => {
    if (active) setOpen(true)
  }, [active])

  if (!item.children) {
    const link = (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          classNames(
            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
          )
        }
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    )
    return collapsed ? <Tooltip label={item.label} side="right">{link}</Tooltip> : link
  }

  return (
    <div>
      <button
        onClick={() => (collapsed ? null : setOpen((o) => !o))}
        className={classNames(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active ? 'text-ink' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
        )}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{item.label}</span>
            <ChevronDown className={classNames('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
          </>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="ml-[22px] mt-0.5 flex flex-col gap-0.5 border-l border-border pl-4 py-0.5">
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) =>
                    classNames(
                      'truncate rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                      isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
                    )
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {collapsed && (
        <Tooltip label={item.label} side="right">
          <span />
        </Tooltip>
      )}
    </div>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, mobileNavOpen, setMobileNavOpen } = useApp()
  const { user } = useAuth()
  const visibleNav = useVisibleNav()

  // Client Portal accounts never get the internal ERP navigation — none of
  // its modules apply to them, so an empty (but still-chrome) sidebar shell
  // would be a confusing leftover rather than a real navigation surface.
  if (user?.portal === 'client') return null

  const content = (collapsed) => (
    <div className="flex h-full flex-col">
      <div className={classNames('flex items-center border-b border-border px-4', collapsed ? 'h-16 justify-center' : 'h-16 justify-between')}>
        <Logo collapsed={collapsed} />
        <button
          onClick={() => setMobileNavOpen(false)}
          className="rounded-md p-1.5 text-ink-faint hover:bg-surface-raised lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="scrollbar-none flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {visibleNav.map((item) => (
          <NavGroup key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>
      <button
        onClick={() => setSidebarCollapsed((c) => !c)}
        className="hidden items-center gap-2.5 border-t border-border px-4 py-3 text-xs font-medium text-ink-muted hover:text-ink lg:flex"
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : (<><ChevronsLeft className="h-4 w-4" /> Collapse</>)}
      </button>
    </div>
  )

  return (
    <>
      <aside
        className={classNames(
          'hidden shrink-0 border-r border-border bg-surface-raised transition-[width] duration-200 lg:block',
          sidebarCollapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {content(sidebarCollapsed)}
      </aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="relative z-10 h-full w-72 bg-surface-raised shadow-popover"
            >
              {content(false)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
