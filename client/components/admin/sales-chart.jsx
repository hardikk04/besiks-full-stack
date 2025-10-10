"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", sales: 18600, orders: 240 },
  { month: "February", sales: 30500, orders: 380 },
  { month: "March", sales: 23700, orders: 290 },
  { month: "April", sales: 7300, orders: 95 },
  { month: "May", sales: 20900, orders: 260 },
  { month: "June", sales: 21400, orders: 275 },
]

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)",
  },
  orders: {
    label: "Orders",
    color: "var(--primary)",
  },
}

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Monthly sales and order trends for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="orders"
              type="natural"
              fill="var(--color-orders)"
              fillOpacity={0.4}
              stroke="var(--color-orders)"
              stackId="a"
            />
            <Area
              dataKey="sales"
              type="natural"
              fill="var(--color-sales)"
              fillOpacity={0.4}
              stroke="var(--color-sales)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
