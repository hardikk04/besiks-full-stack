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
import { ArrowLeft, Upload, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/hooks/uploadImage";
import { useGetAllCategoriesQuery, useGetCategoryByIdQuery, useUpdateCategoryMutation } from "@/features/category/categoryApi";

const EditCategoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = useMemo(() => params?.id, [params]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    sortOrder: "0",
  });
  const [image, setImage] = useState(null); // { url, preview, file }
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const { data: allCategories } = useGetAllCategoriesQuery();
  const { data: categoryRes, isLoading } = useGetCategoryByIdQuery(categoryId, { skip: !categoryId });
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  useEffect(() => {
    if (categoryRes?.category) {
      const c = categoryRes.category;
      setFormData({
        name: c.name || "",
        description: c.description || "",
        parent: c.parent || "",
        sortOrder: (c.sortOrder ?? 0).toString(),
      });
      setImage(c.image ? { url: c.image, preview: c.image, file: null, name: "image" } : null);
      setIsActive(Boolean(c.isActive));
    }
  }, [categoryRes]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Image is too large. Please use an image under 5MB.");
        return;
      }
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only JPEG, PNG, or WebP images");
        return;
      }
      setImage({ file, preview: URL.createObjectURL(file), name: file.name });
      toast.success("Image selected successfully");
    }
  };

  const removeImage = () => {
    setImage(null);
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
    toast.success("Image removed");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Category name is required";
    if (formData.name.length > 50) newErrors.name = "Category name cannot be more than 50 characters";
    if (formData.description && formData.description.length > 200) newErrors.description = "Description cannot be more than 200 characters";
    if (formData.sortOrder && isNaN(Number(formData.sortOrder))) newErrors.sortOrder = "Sort order must be a number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    let imageCloudUrl = image?.url || null;
    if (image?.file) {
      imageCloudUrl = await uploadToCloudinary(image);
      if (!imageCloudUrl) {
        toast.error("Image upload failed");
        return;
      }
    }

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
      image: imageCloudUrl,
      parent: formData.parent === "none" || !formData.parent ? null : formData.parent,
      isActive: isActive,
      sortOrder: parseInt(formData.sortOrder) || 0,
      updatedAt: new Date().toISOString(),
    };

    try {
      toast.loading("Updating category...");
      await updateCategory({ id: categoryId, categoryInput: categoryData }).unwrap();
      toast.dismiss();
      toast.success("✅ Category updated successfully");
      router.push("/admin/categories");
    } catch (err) {
      toast.dismiss();
      toast.error(err?.data?.message || "❌ Failed to update category");
    }
  };

  const categories = allCategories?.categories || [];

  if (isLoading) {
    return <div className="container mx-auto py-6 px-4 lg:px-6">Loading...</div>;
  }

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
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground mt-2">Update category details</p>
      </div>

      <form encType="multipart/form-data" className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about the category</CardDescription>
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
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                <p className="text-xs text-muted-foreground">Maximum 50 characters ({formData.name.length}/50)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the category..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  maxLength={200}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                <p className="text-xs text-muted-foreground">Maximum 200 characters ({formData.description.length}/200)</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="active">{isActive ? "Active" : "Draft"}</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
              <CardDescription>Upload an image to represent this category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {!image && (
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input id="image-upload" type="file" name="image" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                )}

                {image && (
                  <div className="relative">
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={image.preview} alt="Category preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{image.name || "image"}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Hierarchy</CardTitle>
              <CardDescription>Set parent category and ordering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Category</Label>
                <Select value={formData.parent} onValueChange={(value) => handleInputChange("parent", value)}>
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
                <p className="text-xs text-muted-foreground">Leave empty to create a top-level category</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input id="sortOrder" type="number" placeholder="0" value={formData.sortOrder} onChange={(e) => handleInputChange("sortOrder", e.target.value)} min="0" />
                {errors.sortOrder && <p className="text-sm text-red-500">{errors.sortOrder}</p>}
                <p className="text-xs text-muted-foreground">Lower numbers appear first in listings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdating}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditCategoryPage;


