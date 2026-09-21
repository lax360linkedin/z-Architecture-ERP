import { createContext, useContext, useState } from 'react'
import { branches } from '../data/admin'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [currentBranch, setCurrentBranch] = useState(branches[0])
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)

  return (
    <AppContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileNavOpen,
        setMobileNavOpen,
        currentBranch,
        setCurrentBranch,
        branches,
        commandPaletteOpen,
        setCommandPaletteOpen,
        globalSearchOpen,
        setGlobalSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
