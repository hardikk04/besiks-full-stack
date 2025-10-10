"use client"

import { IconSearch } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function AdminHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {/* <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search products, orders, customers..." className="pl-8" />
        </div>
        <Button variant="outline" size="sm">
          Advanced Search
        </Button>
      </div> */}
    </header>
  )
}
