import { useEffect, useRef, useState, cloneElement } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { classNames } from '../../utils/format'

export function Dropdown({ trigger, children, align = 'right', width = 'w-56' }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
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

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      setPos({
        top: rect.bottom + 6,
        left: align === 'right' ? rect.right : rect.left,
      })
    }
    setOpen((o) => !o)
  }

  return (
    <>
      {cloneElement(trigger, { ref: triggerRef, onClick: openMenu })}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              style={{ position: 'fixed', top: pos.top, left: align === 'right' ? pos.left : pos.left, transform: align === 'right' ? 'translateX(-100%)' : 'none' }}
              className={classNames('z-50 rounded-xl border border-border bg-surface-raised p-1.5 shadow-popover', width)}
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
