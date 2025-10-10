"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconEye, IconSearch, IconTruck } from "@tabler/icons-react";
import { Input } from "../ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

// Enhanced sample orders with more CA-relevant data
const sampleOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    total: 149.98,
    subtotal: 127.1,
    tax: 22.88,
    discount: 0,
    status: "Processing",
    date: "2024-01-15",
    items: 2,
    paymentMethod: "Credit Card",
    shippingAddress: "123 Main St, City, State 12345",
    billingAddress: "123 Main St, City, State 12345",
    orderItems: [
      { name: "Wireless Headphones", quantity: 1, price: 99.99, sku: "WH-001" },
      { name: "Phone Case", quantity: 1, price: 27.11, sku: "PC-002" },
    ],
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567891",
    total: 89.99,
    subtotal: 76.27,
    tax: 13.72,
    discount: 10.0,
    status: "Shipped",
    date: "2024-01-14",
    items: 1,
    paymentMethod: "PayPal",
    shippingAddress: "456 Oak Ave, Town, State 54321",
    billingAddress: "456 Oak Ave, Town, State 54321",
    orderItems: [{ name: "T-Shirt", quantity: 1, price: 89.99, sku: "TS-003" }],
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    email: "bob@example.com",
    phone: "+1234567892",
    total: 234.5,
    subtotal: 198.73,
    tax: 35.77,
    discount: 25.0,
    status: "Delivered",
    date: "2024-01-13",
    items: 3,
    paymentMethod: "Bank Transfer",
    shippingAddress: "789 Pine Rd, Village, State 98765",
    billingAddress: "789 Pine Rd, Village, State 98765",
    orderItems: [
      { name: "Laptop", quantity: 1, price: 199.99, sku: "LP-001" },
      { name: "Mouse", quantity: 1, price: 29.99, sku: "MS-002" },
      { name: "Keyboard", quantity: 1, price: 29.99, sku: "KB-003" },
    ],
  },
];

export function OrdersTable({ onExportPDF, onExportExcel }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  // Filter orders based on search query
  const filteredOrders = sampleOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToPDF = async (dateFilter = null) => {
    console.log("🔍 Starting PDF export...", dateFilter);
    setIsExporting(true);
    toast.loading("Generating PDF report...");

    try {
      const doc = new jsPDF();

      // Filter orders based on date range if provided
      let filteredOrders = sampleOrders;
      if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
        filteredOrders = sampleOrders.filter((order) => {
          const orderDate = new Date(order.date);
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      console.log("📊 Filtered orders:", filteredOrders.length);

      // Add title and date
      doc.setFontSize(20);
      doc.text("Orders Report", 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

      if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
        doc.text(
          `Date Range: ${dateFilter.startDate} to ${dateFilter.endDate}`,
          20,
          40
        );
      }

      // Prepare data for PDF
      const tableColumns = [
        "Order ID",
        "Customer",
        "Email",
        "Total",
        "Subtotal",
        "Tax",
        "Discount",
        "Status",
        "Date",
        "Payment Method",
      ];

      const tableRows = filteredOrders.map((order) => [
        order.id,
        order.customer,
        order.email,
        `₹${order.total}`,
        `₹${order.subtotal}`,
        `₹${order.tax}`,
        `₹${order.discount}`,
        order.status,
        order.date,
        order.paymentMethod,
      ]);

      console.log("🔧 Adding table to PDF...");

      // Variable to store the final Y position after table
      let finalY = dateFilter ? 50 : 40;

      // Add table to PDF using the imported autoTable function
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: finalY,
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 15 },
          4: { cellWidth: 15 },
          5: { cellWidth: 12 },
          6: { cellWidth: 15 },
          7: { cellWidth: 18 },
          8: { cellWidth: 20 },
          9: { cellWidth: 20 },
        },
        didDrawPage: function (data) {
          // Update finalY with the current Y position after each page
          finalY = data.cursor.y;
        },
      });

      // Add summary section with spacing
      finalY += 20;

      doc.setFontSize(14);
      doc.text("Summary", 20, finalY);
      doc.setFontSize(10);

      const totalOrders = filteredOrders.length;
      const totalRevenue = filteredOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const totalTax = filteredOrders.reduce(
        (sum, order) => sum + order.tax,
        0
      );
      const totalDiscount = filteredOrders.reduce(
        (sum, order) => sum + order.discount,
        0
      );

      doc.text(`Total Orders: ${totalOrders}`, 20, finalY + 10);
      doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 20, finalY + 20);
      doc.text(`Total Tax Collected: ₹${totalTax.toFixed(2)}`, 20, finalY + 30);
      doc.text(
        `Total Discounts: ₹${totalDiscount.toFixed(2)}`,
        20,
        finalY + 40
      );

      // Save the PDF
      const fileName = dateFilter
        ? `orders-report-${dateFilter.startDate}-to-${dateFilter.endDate}.pdf`
        : `orders-report-${new Date().toISOString().split("T")[0]}.pdf`;

      console.log("💾 Saving PDF as:", fileName);
      doc.save(fileName);
      console.log("📄 PDF exported successfully");
      toast.dismiss();
      toast.success("PDF report exported successfully!");
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to export PDF report");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async (dateFilter = null) => {
    console.log("🔍 Starting Excel export...", dateFilter);
    setIsExporting(true);
    toast.loading("Generating Excel report...");

    try {
      // Filter orders based on date range if provided
      let filteredOrders = sampleOrders;
      if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
        filteredOrders = sampleOrders.filter((order) => {
          const orderDate = new Date(order.date);
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      console.log("📊 Filtered orders:", filteredOrders.length);

      // Prepare data for Excel
      const worksheetData = filteredOrders.map((order) => ({
        "Order ID": order.id,
        "Customer Name": order.customer,
        Email: order.email,
        Phone: order.phone,
        "Total Amount": order.total,
        Subtotal: order.subtotal,
        "Tax Amount": order.tax,
        Discount: order.discount,
        Status: order.status,
        "Order Date": order.date,
        "Payment Method": order.paymentMethod,
        "Items Count": order.items,
        "Shipping Address": order.shippingAddress,
        "Billing Address": order.billingAddress,
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(worksheetData);

      // Auto-fit columns
      const colWidths = Object.keys(worksheetData[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws["!cols"] = colWidths;

      // Add summary sheet
      const summaryData = [
        { Metric: "Total Orders", Value: filteredOrders.length },
        {
          Metric: "Total Revenue",
          Value: filteredOrders
            .reduce((sum, order) => sum + order.total, 0)
            .toFixed(2),
        },
        {
          Metric: "Total Tax Collected",
          Value: filteredOrders
            .reduce((sum, order) => sum + order.tax, 0)
            .toFixed(2),
        },
        {
          Metric: "Total Discounts",
          Value: filteredOrders
            .reduce((sum, order) => sum + order.discount, 0)
            .toFixed(2),
        },
        {
          Metric: "Average Order Value",
          Value:
            filteredOrders.length > 0
              ? (
                  filteredOrders.reduce((sum, order) => sum + order.total, 0) /
                  filteredOrders.length
                ).toFixed(2)
              : "0.00",
        },
        { Metric: "Generated On", Value: new Date().toLocaleString() },
        ...(dateFilter && dateFilter.startDate && dateFilter.endDate
          ? [
              {
                Metric: "Date Range",
                Value: `${dateFilter.startDate} to ${dateFilter.endDate}`,
              },
            ]
          : []),
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      summaryWs["!cols"] = [{ wch: 20 }, { wch: 15 }];

      // Add order items sheet
      const itemsData = [];
      filteredOrders.forEach((order) => {
        order.orderItems.forEach((item) => {
          itemsData.push({
            "Order ID": order.id,
            Customer: order.customer,
            "Item Name": item.name,
            SKU: item.sku,
            Quantity: item.quantity,
            "Unit Price": item.price,
            "Total Price": (item.quantity * item.price).toFixed(2),
            "Order Date": order.date,
          });
        });
      });

      const itemsWs = XLSX.utils.json_to_sheet(itemsData);
      itemsWs["!cols"] = Object.keys(itemsData[0] || {}).map(() => ({
        wch: 15,
      }));

      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
      XLSX.utils.book_append_sheet(wb, itemsWs, "Order Items");

      // Save the Excel file
      const fileName = dateFilter
        ? `orders-report-${dateFilter.startDate}-to-${dateFilter.endDate}.xlsx`
        : `orders-report-${new Date().toISOString().split("T")[0]}.xlsx`;

      console.log("💾 Saving Excel as:", fileName);
      XLSX.writeFile(wb, fileName);
      console.log("📊 Excel exported successfully");
      toast.dismiss();
      toast.success("Excel report exported successfully!");
    } catch (error) {
      console.error("❌ Error generating Excel:", error);
      toast.dismiss();
      toast.error("Failed to export Excel report");
    } finally {
      setIsExporting(false);
    }
  };

  // Update the export handlers when they change
  useEffect(() => {
    window.exportOrdersPDF = exportToPDF;
    window.exportOrdersExcel = exportToExcel;
  }, []);
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-2 pb-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders by ID, customer, email, or status..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <div className="text-sm text-muted-foreground">
            {filteredOrders.length} of {sampleOrders.length} orders
          </div>
        )}
        {isExporting && (
          <div className="text-sm text-blue-600">Exporting...</div>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-2"></TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery
                    ? "No orders found matching your search"
                    : "No orders available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order, index) => (
                <TableRow key={order.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono font-medium">
                    <Link href={"/admin/orders/aasdfasdf"}>{order.id}</Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{order.items} items</TableCell>
                  <TableCell className="font-medium">₹{order.total}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Delivered"
                          ? "default"
                          : order.status === "Shipped"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconTruck className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
