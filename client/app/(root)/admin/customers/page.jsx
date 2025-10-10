"use client";
import { CustomersTable } from "@/components/admin/customers-table";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          Manage customer accounts and information
        </p>
      </div>
      <CustomersTable />
    </div>
  );
}
