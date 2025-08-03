'use client'

import { ReactNode, useEffect } from 'react'
import { SidebarProvider } from '@superscale/ui/components/sidebar'
import { NavProvider } from './nav-context'

export function SidebarWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log('[SidebarWrapper] Mounted')
    return () => console.log('[SidebarWrapper] Unmounted')
  }, [])
  
  return (
    <NavProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </NavProvider>
  )
}