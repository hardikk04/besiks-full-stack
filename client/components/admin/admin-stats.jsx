"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  IconTrendingUp,
  IconTrendingDown,
  IconShoppingCart,
  IconUsers,
  IconPackage,
  IconCreditCard,
} from "@tabler/icons-react"

const stats = [
  {
    title: "Total Revenue",
    value: "₹45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: IconCreditCard,
  },
  {
    title: "Orders",
    value: "2,350",
    change: "+180.1%",
    trend: "up",
    icon: IconShoppingCart,
  },
  {
    title: "Products",
    value: "1,234",
    change: "+19%",
    trend: "up",
    icon: IconPackage,
  },
  {
    title: "Customers",
    value: "573",
    change: "+201",
    trend: "up",
    icon: IconUsers,
  },
]

export function AdminStats() {
  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {stat.trend === "up" ? (
                <IconTrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <IconTrendingDown className="h-3 w-3 text-red-500" />
              )}
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
