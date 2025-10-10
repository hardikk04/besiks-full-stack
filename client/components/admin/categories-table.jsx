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
import { Input } from "@/components/ui/input";
import { IconEdit, IconTrash, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useDeleteCategoryMutation,
  useGetAllCategoriesQuery,
  useUpdateIsActiveMutation,
  useSearchCategoryQuery,
} from "@/features/category/categoryApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useDebounce from "@/hooks/useDebounce";

// Mock category data - replace with your actual API data
const mockCategories = [
  {
    _id: "1",
    name: "Electronics",
    description: "Electronic devices and gadgets",
    image: "/placeholder.jpg",
    parent: null,
    isActive: true,
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "2",
    name: "Smartphones",
    description: "Mobile phones and accessories",
    image: "/placeholder.jpg",
    parent: "1", // Electronics
    isActive: true,
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "3",
    name: "Clothing",
    description: "Apparel and fashion items",
    image: "/placeholder.jpg",
    parent: null,
    isActive: true,
    sortOrder: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "4",
    name: "Men's Clothing",
    description: "Clothing for men",
    image: "/placeholder.jpg",
    parent: "3", // Clothing
    isActive: true,
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "5",
    name: "Home & Garden",
    description: "Home decor and garden supplies",
    image: "/placeholder.jpg",
    parent: null,
    isActive: false,
    sortOrder: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "6",
    name: "Books",
    description: "Books and educational materials",
    image: "/placeholder.jpg",
    parent: null,
    isActive: true,
    sortOrder: 4,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export function CategoriesTable() {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: allCategoriesData,
    error,
    isSuccess,
  } = useGetAllCategoriesQuery();
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useSearchCategoryQuery(debouncedSearchQuery, {
    skip: !debouncedSearchQuery.trim(), // Skip search if query is empty
  });

  const [deleteCategory, { isLoading: isDeletingCategory }] =
    useDeleteCategoryMutation();

  const [updateIsActive] = useUpdateIsActiveMutation();

  const router = useRouter();

  // Determine which data to display
  const displayData = debouncedSearchQuery.trim()
    ? searchData
    : allCategoriesData;

  const getParentCategoryName = (parentId) => {
    if (!parentId) return "Root Category";
    const parentCategory = categories.find((cat) => cat._id === parentId);
    return parentCategory ? parentCategory.name : "Unknown";
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId).unwrap();
      toast.success("Category deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  const handleStatusChange = async (categoryId) => {
    try {
      await updateIsActive(categoryId).unwrap();
      toast.success("Category status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      const allCategoryIds = categories?.map((category) => category._id) || [];
      setSelectedCategories(allCategoryIds);
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId, checked) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;

    try {
      await Promise.all(
        selectedCategories.map((id) => deleteCategory(id).unwrap())
      );
      toast.success(
        `${selectedCategories.length} categories deleted successfully`
      );
      setSelectedCategories([]);
    } catch (err) {
      toast.error("Failed to delete some categories");
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedCategories.length === 0) return;

    const targetIsActive = status === "active";

    // Get the current categories data to check their current status
    const allCategories = categories || [];

    // Filter selected categories to only include those that need status change
    const categoriesToUpdate = selectedCategories.filter((categoryId) => {
      const category = allCategories.find((c) => c._id === categoryId);
      // Only update if the current status is different from target status
      return category && category.isActive !== targetIsActive;
    });

    if (categoriesToUpdate.length === 0) {
      const statusText = targetIsActive ? "active" : "draft";
      toast.info(`All selected categories are already ${statusText}`);
      return;
    }

    const statusText = targetIsActive ? "activated" : "set to draft";
    const skippedCount = selectedCategories.length - categoriesToUpdate.length;

    try {
      // Update only categories that need status change
      await Promise.all(
        categoriesToUpdate.map((id) => updateIsActive(id).unwrap())
      );

      let message = `${categoriesToUpdate.length} categories ${statusText} successfully`;
      if (skippedCount > 0) {
        const currentStatusText = targetIsActive ? "active" : "draft";
        message += ` (${skippedCount} already ${currentStatusText})`;
      }

      toast.success(message);
      setSelectedCategories([]);
    } catch (err) {
      toast.error(
        `Failed to ${statusText.replace("set to", "set")} some categories`
      );
    }
  };

  const isAllSelected =
    categories?.length > 0 && selectedCategories.length === categories?.length;
  const isPartiallySelected =
    selectedCategories.length > 0 &&
    selectedCategories.length < (categories?.length || 0);

  const getIndentLevel = (categoryId, level = 0) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (!category || !category.parent || level > 10) return level;
    return getIndentLevel(category.parent, level + 1);
  };

  // const sortedCategories = [...categories].sort((a, b) => {
  //   // First sort by parent (root categories first)
  //   if (!a.parent && b.parent) return -1;
  //   if (a.parent && !b.parent) return 1;

  //   // Then by sortOrder
  //   if (a.sortOrder !== b.sortOrder) {
  //     return a.sortOrder - b.sortOrder;
  //   }

  //   // Finally by name
  //   return a.name.localeCompare(b.name);
  // });

  useEffect(() => {
    if (displayData) {
      setCategories(displayData.categories);
    }
  }, [deleteCategory, displayData]);

  // Debug logging
  useEffect(() => {
    if (debouncedSearchQuery.trim() && searchData) {
      console.log("Search Data:", searchData);
      console.log("Categories from search:", searchData?.categories);
    }
  }, [searchData, debouncedSearchQuery]);

  return (
    <div className="px-4 lg:px-6">
      {/* Search */}
      <div className="flex flex-1 items-center gap-2 pb-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by category name or description..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isSearchLoading && (
          <div className="text-sm text-muted-foreground">Searching...</div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <div className="flex items-center gap-3 pb-4">
          <span className="text-sm text-muted-foreground">
            {selectedCategories.length} selected
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
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.length > 0 ? (
              categories?.map((category, index) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCategories.includes(category._id)}
                      onCheckedChange={(checked) =>
                        handleSelectCategory(category._id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {category.description || "No description"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {getParentCategoryName(category.parent)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {category.sortOrder}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`category-status-${category._id}`}
                        checked={category.isActive}
                        onCheckedChange={() => handleStatusChange(category._id)}
                      />
                      <span className="text-sm font-medium">
                        {category.isActive ? "Active" : "Draft"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* <Link href={`/admin/categories/edit/${category._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconEdit className="h-4 w-4" />
                        </Button>
                      </Link> */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive cursor-pointer"
                        onClick={() => handleDelete(category._id)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {debouncedSearchQuery.trim()
                    ? `No categories found for "${debouncedSearchQuery}"`
                    : "No categories available"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
