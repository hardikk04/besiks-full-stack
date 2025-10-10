import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"

// Sample data for the data table
const sampleData = [
  {
    id: 1,
    header: "Product Overview",
    type: "Executive Summary",
    status: "Done",
    target: "2",
    limit: "4",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Sales Analytics",
    type: "Technical Approach",
    status: "In Progress",
    target: "3",
    limit: "5",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 3,
    header: "Customer Management",
    type: "Design",
    status: "Done",
    target: "1",
    limit: "3",
    reviewer: "Eddie Lake",
  },
  {
    id: 4,
    header: "Order Processing",
    type: "Capabilities",
    status: "Not Started",
    target: "4",
    limit: "6",
    reviewer: "Assign reviewer",
  },
  {
    id: 5,
    header: "Inventory Control",
    type: "Narrative",
    status: "In Progress",
    target: "2",
    limit: "4",
    reviewer: "Jamik Tashpulatov",
  },
]

export default function AdminDashboard() {
  return (
    <div className="@container/main flex flex-col gap-6 py-4 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={sampleData} />
    </div>
  )
}
