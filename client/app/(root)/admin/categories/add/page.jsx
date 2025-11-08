"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Upload, ImageIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
} from "@/features/category/categoryApi";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/hooks/uploadImage";
import slugify from "slugify";

const AddCategoryPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent: "",
    sortOrder: "0",
  });

  const [image, setImage] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const [createCategory, { isLoading: isCategoryLoading }] =
    useCreateCategoryMutation();

  // Mock parent categories - replace with your actual API data
  const mockParentCategories = [
    { _id: "1", name: "Electronics" },
    { _id: "2", name: "Clothing" },
    { _id: "3", name: "Home & Garden" },
    { _id: "4", name: "Books" },
    { _id: "5", name: "Sports" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from name if name changes and slug wasn't manually edited
      if (field === "name" && !isSlugManuallyEdited) {
        updated.slug = slugify(value, { lower: true, strict: true });
      }
      
      return updated;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSlugChange = (value) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: value }));
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Image is too large. Please use an image under 5MB.");
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only JPEG, PNG, or WebP images");
        return;
      }

      setImage({
        file: file,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
      toast.success("Image selected successfully");
    }
  };

  const removeImage = () => {
    setImage(null);
    // Reset file input
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
    toast.success("Image removed");
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Category name cannot be more than 50 characters";
    }

    // Slug validation
    if (formData.slug) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugPattern.test(formData.slug)) {
        newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
      } else if (formData.slug.length > 100) {
        newErrors.slug = "Slug cannot be more than 100 characters";
      }
    }

    // Description validation
    if (formData.description && formData.description.length > 200) {
      newErrors.description = "Description cannot be more than 200 characters";
    }

    // Sort order validation
    if (formData.sortOrder && isNaN(Number(formData.sortOrder))) {
      newErrors.sortOrder = "Sort order must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("❌ Form validation failed:", errors);
      toast.error("Please fix the form errors before submitting");
      return;
    }

    const imageCloudUrl = await uploadToCloudinary(image);

    if (!imageCloudUrl) {
      toast.error("Image upload failed");
      return;
    }

    // Prepare complete category data
    const categoryData = {
      // Basic Information
      name: formData.name.trim(),
      slug: formData.slug?.trim() || undefined,
      description: formData.description?.trim() || "",

      // Image
      image: imageCloudUrl, // In real app, you'd upload to cloud storage first

      // Hierarchy
      parent:
        formData.parent === "none" || !formData.parent ? null : formData.parent,

      // Status and Ordering
      isActive: isActive,
      sortOrder: parseInt(formData.sortOrder) || 0,

      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log complete category data for API integration
    console.log("🎯 Category Data Ready for API:", categoryData);
    console.log("📊 Category Summary:", {
      name: categoryData.name,
      hasDescription: !!categoryData.description,
      hasImage: !!categoryData.image,
      hasParent: !!categoryData.parent,
      sortOrder: categoryData.sortOrder,
      status: categoryData.isActive ? "Active" : "Inactive",
    });

    try {
      // Show loading toast
      toast.loading("Creating category...");
      await createCategory(categoryData).unwrap();

      toast.dismiss();
      toast.success("✅ Category created successfully");

      // Small delay to show success message before navigation

      router.push("/admin/categories");
    } catch (err) {
      console.error("❌ Category creation failed:", err);
      toast.dismiss();
      toast.error(err?.data?.message || "❌ Failed to create category");
    }
  };

  const { data: allCategories, error, isSuccess } = useGetAllCategoriesQuery();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (allCategories) {
      setCategories(allCategories.categories);
    }
  }, [allCategories]);

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Category</h1>
        <p className="text-muted-foreground mt-2">
          Create a new product category to organize your inventory
        </p>
      </div>

      <form
        encType="multipart/form-data"
        className="space-y-8"
        onSubmit={handleSubmit}
      >
        {/* Basic Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about the category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Electronics"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  maxLength={50}
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum 50 characters ({formData.name.length}/50)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL-friendly)</Label>
                <Input
                  id="slug"
                  placeholder="e.g., electronics"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  maxLength={100}
                />
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Auto-generated from name. Edit manually if needed. Maximum 100 characters ({formData.slug.length}/100)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the category..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  maxLength={200}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum 200 characters ({formData.description.length}/200)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="active">{isActive ? "Active" : "Draft"}</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
              <CardDescription>
                Upload an image to represent this category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {!image && (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        name="image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}

                {image && (
                  <div className="relative">
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.preview}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{image.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Hierarchy and Ordering */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Hierarchy</CardTitle>
              <CardDescription>
                Set parent category and ordering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Category</Label>
                <Select
                  value={formData.parent}
                  onValueChange={(value) => handleInputChange("parent", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave empty to create a top-level category
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  placeholder="0"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    handleInputChange("sortOrder", e.target.value)
                  }
                  min="0"
                />
                {errors.sortOrder && (
                  <p className="text-sm text-red-500">{errors.sortOrder}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first in listings
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Category Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-2">
                <p>
                  <strong>Name:</strong> {formData.name || "Not set"}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {formData.description || "No description"}
                </p>
                <p>
                  <strong>Parent:</strong>{" "}
                  {formData.parent && formData.parent !== "none"
                    ? mockParentCategories.find(
                        (cat) => cat._id === formData.parent
                      )?.name || "Unknown"
                    : "Root Category"}
                </p>
                <p>
                  <strong>Sort Order:</strong> {formData.sortOrder || "0"}
                </p>
                <p>
                  <strong>Status:</strong> {isActive ? "Active" : "Inactive"}
                </p>
                <p>
                  <strong>Image:</strong> {image ? "Uploaded" : "No image"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Category
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCategoryPage;
