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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Upload, ImageIcon, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProductMutation } from "@/features/products/productApi";
import { useGetAllCategoriesQuery } from "@/features/category/categoryApi";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/hooks/uploadImage";

const AddProductPage = () => {
  const router = useRouter();

  const { data, error, isSuccess } = useGetAllCategoriesQuery();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    tax: "",
    stock: "",
    sku: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState([]); // {name, value}
  const [colorName, setColorName] = useState("");
  const [colorValue, setColorValue] = useState("#000000");

  const [
    createProduct,
    { isLoading: isLoadingProduct, isError: isCreatingProductError },
  ] = useCreateProductMutation();

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });

    // Clear category error when user selects categories
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: "" }));
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length + images.length > 5) {
      toast.error("You can only upload up to 5 images");
      return;
    }

    // Check file sizes (limit to 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error("Some images are too large. Please use images under 5MB.");
      return;
    }

    // Check file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      toast.error("Please upload only JPEG, PNG, or WebP images");
      return;
    }

    toast.loading("Uploading images to Cloudinary...");

    try {
      const uploadPromises = files.map(async (file) => {
        const imageObj = {
          file: file,
          preview: URL.createObjectURL(file),
          name: file.name,
        };

        const cloudinaryUrl = await uploadToCloudinary(imageObj);

        if (cloudinaryUrl) {
          return {
            file,
            url: cloudinaryUrl,
            name: file.name,
            preview: URL.createObjectURL(file),
          };
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedImages]);
      toast.dismiss();
      toast.success(
        `${uploadedImages.length} image(s) uploaded successfully to Cloudinary`
      );
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.dismiss();
      toast.error("Failed to upload images to Cloudinary");
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (selectedCategories.length === 0)
      newErrors.categories = "At least one category is required";
    if (!formData.price) newErrors.price = "Sale price is required";
    if (!formData.mrp) newErrors.mrp = "MRP is required";
    if (!formData.stock) newErrors.stock = "Stock is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.slug.trim()) newErrors.slug = "URL slug is required";

    // Price validation
    if (formData.price && formData.mrp) {
      if (parseFloat(formData.price) > parseFloat(formData.mrp)) {
        newErrors.price = "Sale price cannot be higher than MRP";
      }
    }

    // Image validation
    if (images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("❌ Form validation failed");
      console.log("❌ Form validation failed:", errors);
      return;
    }

    // Prepare complete product data
    const productData = {
      // Basic Information
      name: formData.name,
      description: formData.description,
      categories: selectedCategories,
      tags: tags,

      // Pricing
      price: parseFloat(formData.price) || 0,
      mrp: parseFloat(formData.mrp) || 0,
      tax: formData.tax || "0",

      // Inventory
      stock: parseInt(formData.stock) || 0,
      sku: formData.sku,
      isActive: isActive,

      // Images - Cloudinary URLs (already uploaded)
      images: images.map((img) => img.url),

      // Variants
      sizes: sizes,
      colors: colors,

      // SEO
      slug: formData.slug,
      metaTitle: formData.metaTitle || "",
      metaDescription: formData.metaDescription || "",

      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // You can now send this data to your API
    // Example: await createProduct(productData);

    try {
      // Show loading toast
      toast.loading("Creating product...");

      await createProduct(productData).unwrap();

      toast.dismiss();
      toast.success("✅ Product Created Successfully");

      router.push("/admin/products");
    } catch (err) {
      console.error("❌ Product creation failed:", err);
      toast.dismiss();
      toast.error(err?.data?.message || "❌ Failed to create product");
    }
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (data) {
      setCategories(data.categories);
    }
  }, [data]);

  // Helper function to build category tree
  const buildCategoryTree = (categories) => {
    const categoryMap = new Map();
    const rootCategories = [];

    // First, create a map of all categories
    categories?.forEach((category) => {
      categoryMap.set(category._id, { ...category, children: [] });
    });

    // Then, organize them into a tree structure
    categories?.forEach((category) => {
      if (category.parent) {
        const parent = categoryMap.get(category.parent);
        if (parent) {
          parent.children.push(categoryMap.get(category._id));
        }
      } else {
        rootCategories.push(categoryMap.get(category._id));
      }
    });

    return rootCategories;
  };

  // Helper function to render categories hierarchically
  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category) => (
      <div key={category._id} className="space-y-1">
        <div
          className={`flex items-center space-x-2 py-1 px-2 rounded-sm hover:bg-muted/50 ${
            level === 0 ? "bg-muted/20" : ""
          }`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          <Checkbox
            id={`category-${category._id}`}
            checked={selectedCategories.includes(category._id)}
            onCheckedChange={() => handleCategoryToggle(category._id)}
          />
          <Label
            htmlFor={`category-${category._id}`}
            className={`text-sm cursor-pointer flex items-center gap-1 flex-1 ${
              level === 0 ? "font-medium" : "font-normal text-muted-foreground"
            }`}
          >
            {/* {level > 0 && (
              <span className="text-muted-foreground text-xs mr-1">{"└─"}</span>
            )} */}
            {category.name}
            {level === 0 && category.children?.length > 0 && (
              <span className="text-xs text-muted-foreground ml-auto bg-muted px-1.5 py-0.5 rounded">
                {category.children.length} subcategories
              </span>
            )}
          </Label>
        </div>
        {category.children?.length > 0 && (
          <div className="ml-2 border-l border-muted pl-2">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const categoryTree = buildCategoryTree(data?.categories);

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
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground mt-2">
          Create a new product with all the necessary details
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Basic information about your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories">Categories *</Label>
                <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                  {data?.categories?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No categories available
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {categoryTree.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No categories available
                        </p>
                      ) : (
                        renderCategoryTree(categoryTree)
                      )}
                    </div>
                  )}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCategories.map((categoryId) => {
                      const category = data?.categories?.find(
                        (cat) => cat._id === categoryId
                      );
                      const parentCategory = category?.parent
                        ? data?.categories?.find(
                            (cat) => cat._id === category.parent
                          )
                        : null;

                      return (
                        <Badge
                          key={categoryId}
                          variant="secondary"
                          className="text-xs"
                        >
                          {parentCategory ? (
                            <span className="text-muted-foreground">
                              {parentCategory.name} → {category?.name}
                            </span>
                          ) : (
                            category?.name
                          )}
                          <button
                            type="button"
                            onClick={() => handleCategoryToggle(categoryId)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {errors.categories && (
                  <p className="text-sm text-red-500">{errors.categories}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Select one or more categories for this product (
                  {selectedCategories.length} selected)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        className="ml-1 hover:text-red-500 focus:outline-none"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload product images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("image-upload").click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Upload up to 5 images (JPG, PNG, WebP)
                    </p>
                    {errors.images && (
                      <p className="text-sm text-red-500">{errors.images}</p>
                    )}
                  </div>
                </div>

                {/* Display uploaded images */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview || image.url}
                          alt={image.name}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Pricing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
            <CardDescription>
              Set your product pricing and tax information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Sale Price *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mrp">MRP (Maximum Retail Price) *</Label>
                <Input
                  id="mrp"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => handleInputChange("mrp", e.target.value)}
                  required
                />
                {errors.mrp && (
                  <p className="text-sm text-red-500">{errors.mrp}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">Tax Rate (%)</Label>
              <Select
                value={formData.tax}
                onValueChange={(value) => handleInputChange("tax", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (Tax-free)</SelectItem>
                  <SelectItem value="5">5% GST</SelectItem>
                  <SelectItem value="12">12% GST</SelectItem>
                  <SelectItem value="18">18% GST</SelectItem>
                  <SelectItem value="28">28% GST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Inventory Section */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>
              Manage stock levels and product information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock">Total Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  required
                />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Stock Keeping Unit) *</Label>
                <Input
                  id="sku"
                  placeholder="Enter SKU"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  required
                />
                {errors.sku && (
                  <p className="text-sm text-red-500">{errors.sku}</p>
                )}
              </div>
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

        <Separator />

        {/* Variants Section */}
        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
            <CardDescription>Add sizes and colors for this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sizes */}
            <div className="space-y-2">
              <Label htmlFor="size">Sizes</Label>
              <div className="flex gap-2">
                <Input
                  id="size"
                  placeholder="e.g. S, M, L, XL"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
                        setSizes([...sizes, sizeInput.trim()]);
                        setSizeInput("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
                      setSizes([...sizes, sizeInput.trim()]);
                      setSizeInput("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizes.map((s, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1 pr-1">
                      <span>{s}</span>
                      <button
                        type="button"
                        className="ml-1 hover:text-red-500 focus:outline-none"
                        onClick={() => setSizes(sizes.filter((x) => x !== s))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label>Colors</Label>
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                <Input
                  placeholder="Color name (e.g. Black)"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                />
                <input
                  type="color"
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="h-10 w-12 p-0 border rounded"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (colorName.trim()) {
                      setColors([...colors, { name: colorName.trim(), value: colorValue }]);
                      setColorName("");
                      setColorValue("#000000");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {colors.map((c, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-2 pr-1">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 rounded-sm border" style={{ backgroundColor: c.value }} />
                        {c.name}
                      </span>
                      <button
                        type="button"
                        className="ml-1 hover:text-red-500 focus:outline-none"
                        onClick={() => setColors(colors.filter((_, i) => i !== idx))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* SEO Section */}
        <Card>
          <CardHeader>
            <CardTitle>SEO & Meta Information</CardTitle>
            <CardDescription>
              Optimize your product for search engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                placeholder="product-url-slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                required
              />
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                placeholder="SEO optimized title"
                maxLength={60}
                value={formData.metaTitle}
                onChange={(e) => handleInputChange("metaTitle", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 50-60 characters ({formData.metaTitle.length}/60)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                placeholder="Brief description for search engines"
                rows={3}
                maxLength={160}
                value={formData.metaDescription}
                onChange={(e) =>
                  handleInputChange("metaDescription", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 150-160 characters (
                {formData.metaDescription.length}/160)
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit">Publish Product</Button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
