"use client"

import { Building2 } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@superscale/ui/components/sidebar"

export function OrgIndicator({
  organization,
}: {
  organization: {
    name: string
    slug: string
  }
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-md px-3 py-2 text-left outline-none">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{organization.name}</span>
            <span className="truncate text-xs">/{organization.slug}</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}