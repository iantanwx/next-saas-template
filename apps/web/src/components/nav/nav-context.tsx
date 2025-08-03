'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface NavContextType {
  openedMenus: Record<string, boolean>
  setOpenedMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

const NavContext = createContext<NavContextType | undefined>(undefined)

export function NavProvider({ children }: { children: ReactNode }) {
  // Initialize from sessionStorage if available
  const [openedMenus, setOpenedMenus] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('nav-opened-menus')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
    return {}
  })
  
  // Persist to sessionStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nav-opened-menus', JSON.stringify(openedMenus))
    }
  }, [openedMenus])
  
  console.log('[NavProvider] Current openedMenus:', openedMenus)
  
  return (
    <NavContext.Provider value={{ openedMenus, setOpenedMenus }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const context = useContext(NavContext)
  if (!context) {
    throw new Error('useNav must be used within a NavProvider')
  }
  return context
}