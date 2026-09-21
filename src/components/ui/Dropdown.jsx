import { useEffect, useLayoutEffect, useRef, useState, cloneElement } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { classNames } from '../../utils/format'

// Minimum gap kept between the menu and every viewport edge.
const EDGE_MARGIN = 8

export function Dropdown({ trigger, children, align = 'right', width = 'w-56' }) {
  const [open, setOpen] = useState(false)
  // null until the menu has an on-screen position to render at, so it never
  // flashes at an unclamped (potentially off-screen) spot before measurement.
  const [pos, setPos] = useState(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Runs synchronously after the menu mounts (and on every resize/scroll
  // while open) so we can measure its real, rendered size and clamp it
  // fully inside the viewport — flipping above the trigger when there's
  // more room there, and sliding left/right off the preferred alignment
  // when the trigger sits near an edge. useLayoutEffect fires before the
  // browser paints, so the corrected position is the only one ever seen.
  useLayoutEffect(() => {
    if (!open) return
    function reposition() {
      const triggerRect = triggerRef.current?.getBoundingClientRect()
      const menuEl = menuRef.current
      if (!triggerRect || !menuEl) return
      const menuRect = menuEl.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight

      let left = align === 'right' ? triggerRect.right - menuRect.width : triggerRect.left
      left = Math.min(left, vw - menuRect.width - EDGE_MARGIN)
      left = Math.max(left, EDGE_MARGIN)

      const spaceBelow = vh - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const fitsBelow = menuRect.height + EDGE_MARGIN <= spaceBelow
      let top = !fitsBelow && spaceAbove > spaceBelow ? triggerRect.top - menuRect.height - 6 : triggerRect.bottom + 6
      top = Math.min(top, vh - menuRect.height - EDGE_MARGIN)
      top = Math.max(top, EDGE_MARGIN)

      setPos({ top, left })
    }
    reposition()
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [open, align])

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    // Provisional position so the menu has somewhere to mount for the very
    // first measurement pass — corrected in place before paint, above.
    if (rect) setPos({ top: rect.bottom + 6, left: align === 'right' ? Math.max(rect.right - 280, EDGE_MARGIN) : rect.left })
    setOpen((o) => !o)
  }

  return (
    <>
      {cloneElement(trigger, { ref: triggerRef, onClick: openMenu })}
      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              style={{ position: 'fixed', top: pos.top, left: pos.left, maxHeight: `calc(100vh - ${EDGE_MARGIN * 2}px)`, maxWidth: `calc(100vw - ${EDGE_MARGIN * 2}px)` }}
              className={classNames('z-50 overflow-y-auto rounded-xl border border-border bg-surface-raised p-1.5 shadow-popover', width)}
            >
              {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export function DropdownItem({ icon: Icon, children, danger, className, ...props }) {
  return (
    <button
      className={classNames(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
        danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40' : 'text-ink hover:bg-surface-subtle',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 opacity-70" />}
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="my-1.5 h-px bg-border" />
}

export function Tooltip({ children, label, side = 'top' }) {
  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={classNames(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-surface opacity-0 transition-opacity duration-100 group-hover/tooltip:opacity-100',
          sideClasses[side]
        )}
      >
        {label}
      </span>
    </span>
  )
}
