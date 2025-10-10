"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconShoppingCart,
  IconCurrencyDollar,
  IconEye,
  IconClick,
} from "@tabler/icons-react"

// Sample analytics data
const revenueData = [
  { month: "Jan", revenue: 45000, orders: 120, customers: 89 },
  { month: "Feb", revenue: 52000, orders: 145, customers: 102 },
  { month: "Mar", revenue: 48000, orders: 132, customers: 95 },
  { month: "Apr", revenue: 61000, orders: 168, customers: 118 },
  { month: "May", revenue: 55000, orders: 152, customers: 108 },
  { month: "Jun", revenue: 67000, orders: 189, customers: 134 },
]

const topProducts = [
  { name: "Wireless Headphones", sales: 1234, revenue: 98720, growth: 12.5 },
  { name: "Smart Watch", sales: 987, revenue: 147300, growth: 8.3 },
  { name: "Laptop Stand", sales: 756, revenue: 45360, growth: -2.1 },
  { name: "USB-C Cable", sales: 654, revenue: 19620, growth: 15.7 },
  { name: "Phone Case", sales: 543, revenue: 16290, growth: 5.2 },
]

const trafficSources = [
  { name: "Organic Search", value: 45, color: "#8884d8" },
  { name: "Direct", value: 25, color: "#82ca9d" },
  { name: "Social Media", value: 15, color: "#ffc658" },
  { name: "Email", value: 10, color: "#ff7300" },
  { name: "Paid Ads", value: 5, color: "#00ff88" },
]

const conversionData = [
  { step: "Visitors", count: 10000, rate: 100 },
  { step: "Product Views", count: 6500, rate: 65 },
  { step: "Add to Cart", count: 2600, rate: 26 },
  { step: "Checkout", count: 1300, rate: 13 },
  { step: "Purchase", count: 780, rate: 7.8 },
]

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Last 30 days</Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹328,000</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <IconTrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,306</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <IconTrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">646</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <IconTrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.8%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <IconTrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +0.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue and order trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                    orders: { label: "Orders", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="var(--color-revenue)"
                        fill="var(--color-revenue)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your customers come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    visitors: { label: "Visitors", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Customer journey from visitor to purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionData.map((step, index) => (
                  <div key={step.step} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium">{step.step}</div>
                    <div className="flex-1">
                      <Progress value={step.rate} className="h-2" />
                    </div>
                    <div className="w-16 text-sm text-muted-foreground text-right">{step.count.toLocaleString()}</div>
                    <div className="w-12 text-sm font-medium text-right">{step.rate}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best selling products by revenue and units sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.sales} units sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{product.revenue.toLocaleString()}</div>
                      <div
                        className={`text-sm flex items-center ${
                          product.growth > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.growth > 0 ? (
                          <IconTrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <IconTrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(product.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New vs returning customers</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    customers: { label: "Customers", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="customers" stroke="var(--color-customers)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Customer distribution by value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Value (&gt;₹1000)</span>
                  <span className="text-sm font-medium">156 customers</span>
                </div>
                <Progress value={15} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium Value (₹500-₹1000)</span>
                  <span className="text-sm font-medium">324 customers</span>
                </div>
                <Progress value={32} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Value (&lt;₹500)</span>
                  <span className="text-sm font-medium">520 customers</span>
                </div>
                <Progress value={53} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <IconEye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45,231</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                <IconUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,234</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <IconTrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32.4%</div>
                <p className="text-xs text-muted-foreground">-2% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
