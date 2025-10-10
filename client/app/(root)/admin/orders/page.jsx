"use client";

import { OrdersTable } from "@/components/admin/orders-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function OrdersPage() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const handleExportPDF = (withDateRange = false) => {
    console.log("🖱️ Export PDF clicked, withDateRange:", withDateRange);

    if (withDateRange) {
      setExportType("pdf");
      setIsExportDialogOpen(true);
    } else {
      console.log(
        "🔍 Checking if window.exportOrdersPDF exists:",
        typeof window.exportOrdersPDF
      );
      if (window.exportOrdersPDF) {
        console.log("✅ Calling window.exportOrdersPDF");
        window.exportOrdersPDF();
      } else {
        console.log("❌ window.exportOrdersPDF not found");
      }
    }
  };

  const handleExportExcel = (withDateRange = false) => {
    if (withDateRange) {
      setExportType("excel");
      setIsExportDialogOpen(true);
    } else {
      if (window.exportOrdersExcel) {
        window.exportOrdersExcel();
      }
    }
  };

  const executeExportWithDateRange = () => {
    const exportData = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };

    if (exportType === "pdf" && window.exportOrdersPDF) {
      window.exportOrdersPDF(exportData);
    } else if (exportType === "excel" && window.exportOrdersExcel) {
      window.exportOrdersExcel(exportData);
    }

    setIsExportDialogOpen(false);
    setDateRange({ startDate: "", endDate: "" });
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quick Export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExportPDF(false)}>
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportExcel(false)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Export with Date Range</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleExportPDF(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              PDF with Date Range
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportExcel(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              Excel with Date Range
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <OrdersTable
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Export Orders to {exportType === "pdf" ? "PDF" : "Excel"}
            </DialogTitle>
            <DialogDescription>
              Select a date range to export orders for your Chartered
              Accountant.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={executeExportWithDateRange}
              disabled={!dateRange.startDate || !dateRange.endDate}
            >
              <Download className="mr-2 h-4 w-4" />
              Export {exportType === "pdf" ? "PDF" : "Excel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
