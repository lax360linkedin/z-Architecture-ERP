import { Outlet } from 'react-router-dom'
import { LogoMark } from '../components/layout/Logo'
import { BarChart3, ShieldCheck, Building2 } from 'lucide-react'

const highlights = [
  { icon: Building2, title: 'Full project lifecycle', desc: 'From lead to handover — CRM, design, procurement, site and finance in one place.' },
  { icon: BarChart3, title: 'Real-time visibility', desc: 'Budgets, drawings, approvals and cash flow tracked across every active project.' },
  { icon: ShieldCheck, title: 'Enterprise-grade control', desc: 'Role-based access, approval workflows and a full audit trail out of the box.' },
]

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-surface-subtle">
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-[#221046] p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <div className="leading-none">
            <p className="text-xl font-bold tracking-tight font-[Inter_Tight]">LAX360</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/70">Architecture ERP</p>
          </div>
        </div>
        <div className="relative">
          <h2 className="max-w-md text-[28px] font-bold leading-tight tracking-tight font-[Inter_Tight]">
            The operating system for architecture &amp; design-build practices.
          </h2>
          <div className="mt-10 flex flex-col gap-6">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <h.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{h.title}</p>
                  <p className="mt-0.5 text-sm text-white/70">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} LAX360 Design &amp; Build Pvt. Ltd. All rights reserved.</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <LogoMark className="h-9 w-9" />
          <div className="leading-none">
            <p className="text-lg font-bold tracking-tight text-ink font-[Inter_Tight]">LAX360</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">Architecture ERP</p>
          </div>
        </div>
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
