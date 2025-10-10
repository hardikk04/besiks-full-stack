"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteCustomerMutation,
  useGetAllCustomersQuery,
} from "@/features/customer/customerApi";
import { Trash } from "lucide-react";
import { Input } from "../ui/input";
import { IconSearch } from "@tabler/icons-react";
import { toast } from "sonner";
import { useState } from "react";

export function CustomersTable() {
  const { data, error, success, isLoading, isError } =
    useGetAllCustomersQuery();
  const [deleteCustomer, { isLoading: isDeleting }] =
    useDeleteCustomerMutation();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter customers based on search query
  const filteredCustomers =
    data?.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery) ||
        customer.address?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleDeleteCustomer = async (id, customerName) => {
    try {
      await deleteCustomer(id).unwrap();
      toast.success(`Customer "${customerName}" deleted successfully`);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      toast.error(err?.data?.message || "Failed to delete customer");
    }
  };

  // Show loading toast on initial load
  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading customers...</div>
        </div>
      </div>
    );
  }

  // Show error toast and fallback UI
  if (isError) {
    toast.error("Failed to load customers");
    return (
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-destructive">
            Failed to load customers. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-2 pb-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers by name, email, phone, or address..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <div className="text-sm text-muted-foreground">
            {filteredCustomers.length} of {data?.length || 0} customers
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-2">No.</TableHead>
              <TableHead className="w-64">Customer</TableHead>
              <TableHead className="w-32">Phone</TableHead>
              <TableHead className="w-80">Address</TableHead>
              <TableHead className="w-32 text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery
                    ? "No customers found matching your search"
                    : "No customers available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer, index) => (
                <TableRow key={customer._id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="max-w-64">
                      <div className="font-medium truncate">
                        {customer.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="truncate">
                    {customer.phone || "N/A"}
                  </TableCell>
                  <TableCell className="max-w-80">
                    <div className="truncate" title={customer.address}>
                      {customer.address || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete customer "${customer.name}"?`
                            )
                          ) {
                            handleDeleteCustomer(customer._id, customer.name);
                          }
                        }}
                        disabled={isDeleting}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete customer"
                      >
                        <Trash className="h-4 w-4" />
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
