import { classNames } from '../../utils/format'

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#lax360-grad)" />
      <path d="M12 27V13h3.2v11.2H21V27H12Z" fill="white" />
      <path d="M22.5 27 27 19.8 22.7 13h3.7l2.4 4.1 2.4-4.1h3.6l-4.3 6.7L34.9 27h-3.7l-2.7-4.5L25.9 27h-3.4Z" fill="white" fillOpacity="0.92" />
      <defs>
        <linearGradient id="lax360-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c5cf6" />
          <stop offset="1" stopColor="#4b21b3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Logo({ collapsed, className }) {
  return (
    <div className={classNames('flex items-center gap-2.5 overflow-hidden', className)}>
      <LogoMark className="h-8 w-8 shrink-0" />
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-ink font-[Inter_Tight]">LAX360</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">Architecture ERP</span>
        </div>
      )}
    </div>
  )
}
