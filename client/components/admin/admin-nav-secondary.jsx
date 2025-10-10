"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AdminNavSecondary({ items, title, ...props }) {
  return (
    <SidebarGroup {...props}>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name || item.title}>
            <SidebarMenuButton tooltip={item.name || item.title} size="sm" asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name || item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
