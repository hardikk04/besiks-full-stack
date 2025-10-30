"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Trash2, Copy, Edit } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useDeleteCouponMutation,
  useGetAllCouponQuery,
  useUpdateIsActiveMutation,
} from "@/features/discount/discountApi";
import { toast } from "sonner";

export function CouponsTable() {
  const { data, isLoading: isCouponsLoading } = useGetAllCouponQuery();
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [deleteCoupon, { isLoading: isDeletingCoupon }] =
    useDeleteCouponMutation();
  const [updateIsActive] = useUpdateIsActiveMutation();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDiscount = (type, value) => {
    return type === "percentage" ? `${value}%` : `₹${value}`;
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    const validFrom = new Date(coupon.validFrom);

    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (now < validFrom) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return <Badge variant="destructive">Used Up</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const getUsagePercentage = (coupon) => {
    if (!coupon.usageLimit) return null;
    return Math.round((coupon.usageCount / coupon.usageLimit) * 100);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied "${text}" to clipboard!`);
  };

  const handleDelete = async (couponId) => {
    try {
      await deleteCoupon(couponId).unwrap();
      toast.success("Coupon deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete coupon");
    }
  };

  const handleStatusChange = async (couponId) => {
    try {
      await updateIsActive(couponId).unwrap();
      toast.success("Coupon status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      const allCouponIds = coupons?.map((coupon) => coupon._id) || [];
      setSelectedCoupons(allCouponIds);
    } else {
      setSelectedCoupons([]);
    }
  };

  const handleSelectCoupon = (couponId, checked) => {
    if (checked) {
      setSelectedCoupons((prev) => [...prev, couponId]);
    } else {
      setSelectedCoupons((prev) => prev.filter((id) => id !== couponId));
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedCoupons.length === 0) return;

    try {
      await Promise.all(selectedCoupons.map((id) => deleteCoupon(id).unwrap()));
      toast.success(`${selectedCoupons.length} coupons deleted successfully`);
      setSelectedCoupons([]);
    } catch (err) {
      toast.error("Failed to delete some coupons");
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedCoupons.length === 0) return;

    const targetIsActive = status === "active";

    // Get the current coupons data to check their current status
    const allCoupons = coupons || [];

    // Filter selected coupons to only include those that need status change
    const couponsToUpdate = selectedCoupons.filter((couponId) => {
      const coupon = allCoupons.find((c) => c._id === couponId);
      // Only update if the current status is different from target status
      return coupon && coupon.isActive !== targetIsActive;
    });

    if (couponsToUpdate.length === 0) {
      const statusText = targetIsActive ? "active" : "inactive";
      toast.info(`All selected coupons are already ${statusText}`);
      return;
    }

    const statusText = targetIsActive ? "activated" : "deactivated";
    const skippedCount = selectedCoupons.length - couponsToUpdate.length;

    try {
      // Update only coupons that need status change
      await Promise.all(
        couponsToUpdate.map((id) => updateIsActive(id).unwrap())
      );

      let message = `${couponsToUpdate.length} coupons ${statusText} successfully`;
      if (skippedCount > 0) {
        const currentStatusText = targetIsActive ? "active" : "inactive";
        message += ` (${skippedCount} already ${currentStatusText})`;
      }

      toast.success(message);
      setSelectedCoupons([]);
    } catch (err) {
      toast.error(
        `Failed to ${statusText.replace(
          "deactivated",
          "deactivate"
        )} some coupons`
      );
    }
  };

  const isAllSelected =
    coupons?.length > 0 && selectedCoupons.length === coupons?.length;
  const isPartiallySelected =
    selectedCoupons.length > 0 &&
    selectedCoupons.length < (coupons?.length || 0);

  useEffect(() => {
    if (data) {
      setCoupons(data.data);
    }
  }, [data]);

  return (
    <div className="px-4 lg:px-6">
      {/* Bulk Actions */}
      {selectedCoupons.length > 0 && (
        <div className="flex items-center gap-3 pb-4">
          <span className="text-sm text-muted-foreground">
            {selectedCoupons.length} selected
          </span>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Set status:</span>
            <Select onValueChange={handleBulkStatusChange}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active</span>
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Inactive</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="mx-auto"
                  data-state={isPartiallySelected ? "indeterminate" : undefined}
                />
              </TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length > 0 ? (
              coupons.map((coupon, index) => (
                <TableRow key={coupon._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCoupons.includes(coupon._id)}
                      onCheckedChange={(checked) =>
                        handleSelectCoupon(coupon._id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        {coupon.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{coupon.name}</span>
                  </TableCell>
                  <TableCell>
                    {formatDiscount(coupon.discountType, coupon.discountValue)}
                  </TableCell>
                  <TableCell>
                    {coupon.usageCount}
                    {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                  </TableCell>
                  <TableCell>{formatDate(coupon.validUntil)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`coupon-status-${coupon._id}`}
                        checked={coupon.isActive}
                        onCheckedChange={() => handleStatusChange(coupon._id)}
                      />
                      <span className="text-sm font-medium">
                        {coupon.isActive ? "Active" : "Draft"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/discount/edit/${coupon._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive cursor-pointer"
                        onClick={() => handleDelete(coupon._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No coupons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
