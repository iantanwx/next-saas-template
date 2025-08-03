"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@superscale/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@superscale/ui/components/sidebar"

export function NavMain({
  items,
  openedMenus,
  setOpenedMenus,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  openedMenus: Record<string, boolean>
  setOpenedMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const pathname = usePathname()
  
  // Check which menus should be open based on current path
  const menusToOpen = items.filter((item) => {
    if (!item.items?.length) return false
    const hasActiveSubItem = item.items.some((subItem) => pathname === subItem.url)
    const isCurrentPage = pathname === item.url
    return (hasActiveSubItem || isCurrentPage) && !openedMenus[item.title]
  }).map(item => item.title)
  
  // Open menus with active content
  useEffect(() => {
    if (menusToOpen.length > 0) {
      setOpenedMenus(prev => {
        const newState = { ...prev }
        menusToOpen.forEach(title => {
          newState[title] = true
        })
        return newState
      })
    }
  }, [menusToOpen.join(',')]) // Only depend on which menus need opening
  
  const toggleItem = (itemTitle: string) => {
    setOpenedMenus(prev => ({
      ...prev,
      [itemTitle]: true // Once opened, always stays open
    }))
  }
  
  const isItemOpen = (item: typeof items[0]) => {
    const hasActiveSubItem = item.items?.some((subItem) => pathname === subItem.url)
    const hasBeenOpened = openedMenus[item.title]
    
    // Always open if has active content, or if explicitly opened
    // Use ?? to handle undefined (initial load) - if undefined and has active content, default to true
    if (hasActiveSubItem) {
      return true
    }
    
    // If we have a stored value, use it
    if (hasBeenOpened !== undefined) {
      return hasBeenOpened
    }
    
    // Default: check sessionStorage directly for initial render
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('nav-opened-menus')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          return parsed[item.title] || false
        } catch {
          // Invalid JSON
        }
      }
    }
    
    return false
  }
  
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          // Check if current page matches this item or any of its sub-items
          const hasActiveSubItem = item.items?.some((subItem) => pathname === subItem.url)
          
          // For parent items with sub-items, only highlight if:
          // 1. Current URL matches AND there's no sub-item with the same URL
          // 2. OR if it's a direct match and no sub-items exist
          const isCurrentPage = item.items?.length 
            ? pathname === item.url && !hasActiveSubItem
            : pathname === item.url
          
          // If no sub-items, render as a simple menu item
          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  isActive={isCurrentPage}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }
          
          // Render collapsible menu for items with sub-items
          const isOpen = isItemOpen(item)
          
          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={(open) => {
                if (open) {
                  toggleItem(item.title)
                }
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    isActive={isCurrentPage}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubItemActive = pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
