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
import { IconEdit, IconTrash, IconEye, IconSearch } from "@tabler/icons-react";
import { Input } from "../ui/input";
import Link from "next/link";
import {
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useUpdateIsActiveMutation,
  useSearchProductQuery,
} from "@/features/products/productApi";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import useDebounce from "@/hooks/useDebounce";

const sampleProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    sku: "WH-001",
    category: "Electronics",
    price: 99.99,
    stock: 45,
    status: "Active",
    image: "/diverse-people-listening-headphones.png",
  },
  {
    id: 2,
    name: "Cotton T-Shirt",
    sku: "TS-002",
    category: "Clothing",
    price: 24.99,
    stock: 120,
    status: "Active",
    image: "/plain-white-tshirt.png",
  },
  {
    id: 3,
    name: "Coffee Mug",
    sku: "MG-003",
    category: "Home",
    price: 12.99,
    stock: 0,
    status: "Out of Stock",
    image: "/simple-coffee-mug.png",
  },
];

export function ProductsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: allProductsData, isError } = useGetAllProductsQuery();
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useSearchProductQuery(debouncedSearchQuery, {
    skip: !debouncedSearchQuery.trim(), // Skip search if query is empty
  });

  const [
    deleteProduct,
    { isLoading: isDeletingProduct, isError: isDeletingError },
  ] = useDeleteProductMutation();

  const [updateIsActive] = useUpdateIsActiveMutation();

  // Determine which data to display
  const displayData = debouncedSearchQuery.trim()
    ? searchData
    : allProductsData;

  // Debug logging
  useEffect(() => {
    if (debouncedSearchQuery.trim() && searchData) {
      console.log("Search Data:", searchData);
      console.log("Products from search:", searchData?.products);
    }
  }, [searchData, debouncedSearchQuery]);

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId).unwrap();

      toast.success("Product Deleted");
    } catch (err) {
      console.error("❌ Product creation failed:", err);
      toast.error(err?.data?.message || "❌ Validation failed");
    }
  };

  const handleStautsChange = async (productId) => {
    try {
      await updateIsActive(productId).unwrap();
      toast.success("Product Status Updated");
    } catch (err) {
      toast.error(err?.data?.message || "❌ Failed to updated status");
    }
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      const allProductIds =
        displayData?.products?.map((product) => product._id) || [];
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await Promise.all(
        selectedProducts.map((id) => deleteProduct(id).unwrap())
      );
      toast.success(`${selectedProducts.length} products deleted successfully`);
      setSelectedProducts([]);
    } catch (err) {
      toast.error("Failed to delete some products");
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedProducts.length === 0) return;

    const targetIsActive = status === "active";

    // Get the current products data to check their current status
    const allProducts = displayData?.products || [];

    // Filter selected products to only include those that need status change
    const productsToUpdate = selectedProducts.filter((productId) => {
      const product = allProducts.find((p) => p._id === productId);
      // Only update if the current status is different from target status
      return product && product.isActive !== targetIsActive;
    });

    if (productsToUpdate.length === 0) {
      const statusText = targetIsActive ? "active" : "draft";
      toast.info(`All selected products are already ${statusText}`);
      return;
    }

    const statusText = targetIsActive ? "activated" : "set to draft";
    const skippedCount = selectedProducts.length - productsToUpdate.length;

    try {
      // Update only products that need status change
      await Promise.all(
        productsToUpdate.map((id) => updateIsActive(id).unwrap())
      );

      let message = `${productsToUpdate.length} products ${statusText} successfully`;
      if (skippedCount > 0) {
        const currentStatusText = targetIsActive ? "active" : "draft";
        message += ` (${skippedCount} already ${currentStatusText})`;
      }

      toast.success(message);
      setSelectedProducts([]);
    } catch (err) {
      toast.error(
        `Failed to ${statusText.replace("set to", "set")} some products`
      );
    }
  };

  const isAllSelected =
    displayData?.products?.length > 0 &&
    selectedProducts.length === displayData?.products?.length;
  const isPartiallySelected =
    selectedProducts.length > 0 &&
    selectedProducts.length < (displayData?.products?.length || 0);

  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-2 pb-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by product name, SKU, or category..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isSearchLoading && (
          <div className="text-sm text-muted-foreground">Searching...</div>
        )}

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {selectedProducts.length} selected
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
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Draft</span>
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
              <IconTrash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>
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
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData?.products?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  {debouncedSearchQuery.trim()
                    ? `No products found for "${debouncedSearchQuery}"`
                    : "No products available"}
                </TableCell>
              </TableRow>
            )}
            {displayData?.products?.filter(product => product && product._id).map((product, index) => (
              <TableRow key={product._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.includes(product._id)}
                    onCheckedChange={(checked) =>
                      handleSelectProduct(product._id, checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {product.sku}
                </TableCell>
                <TableCell>{product.categories[0]?.name || "N/A"}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`status-${product._id}`}
                      checked={product.isActive}
                      onCheckedChange={() => handleStautsChange(product._id)}
                    />
                    <span className="text-sm font-medium">
                      {product.isActive ? "Active" : "Draft"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {/* <Link href={"/admin/products/edit/asdfsad"}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    </Link> */}
                    <Button
                      onClick={() => handleDelete(product._id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive cursor-pointer"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
