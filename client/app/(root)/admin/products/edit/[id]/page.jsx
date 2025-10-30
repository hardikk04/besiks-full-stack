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
import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/features/products/productApi";
import { useGetAllCategoriesQuery } from "@/features/category/categoryApi";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/hooks/uploadImage";

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = useMemo(() => params?.id, [params]);

  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: productResponse, isLoading, isError } = useGetProductByIdQuery(productId, { skip: !productId });

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
  const [colors, setColors] = useState([]);
  const [colorName, setColorName] = useState("");
  const [colorValue, setColorValue] = useState("#000000");

  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();

  useEffect(() => {
    if (productResponse?.product) {
      const p = productResponse.product;
      setFormData({
        name: p.name || "",
        description: p.description || "",
        price: p.price?.toString?.() || "",
        mrp: p.mrp?.toString?.() || "",
        tax: (p.tax ?? "").toString(),
        stock: p.stock?.toString?.() || "",
        sku: p.sku || "",
        slug: p.slug || "",
        metaTitle: p.metaTitle || "",
        metaDescription: p.metaDescription || "",
      });
      setSelectedCategories((p.categories || []).map((c) => c?._id || c).filter(Boolean));
      // Tags are stored as IDs server-side; skip prefill unless populated with names
      setTags([]);
      setImages((p.images || []).map((url) => ({ url })));
      setIsActive(Boolean(p.isActive));
      setSizes(p.sizes || []);
      setColors(p.colors || []);
    }
  }, [productResponse]);

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

    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: "" }));
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("You can only upload up to 5 images");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error("Some images are too large. Please use images under 5MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error("Please upload only JPEG, PNG, or WebP images");
      return;
    }

    toast.loading("Uploading images to Cloudinary...");

    try {
      const uploadPromises = files.map(async (file) => {
        const imageObj = { file, preview: URL.createObjectURL(file), name: file.name };
        const cloudinaryUrl = await uploadToCloudinary(imageObj);
        if (cloudinaryUrl) {
          return { file, url: cloudinaryUrl, name: file.name, preview: URL.createObjectURL(file) };
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedImages]);
      toast.dismiss();
      toast.success(`${uploadedImages.length} image(s) uploaded successfully to Cloudinary`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.dismiss();
      toast.error("Failed to upload images to Cloudinary");
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Image removed");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || isNaN(parseFloat(formData.price))) newErrors.price = "Valid price is required";
    if (!formData.stock || isNaN(parseInt(formData.stock))) newErrors.stock = "Valid stock is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (selectedCategories.length === 0) newErrors.categories = "Select at least one category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("❌ Form validation failed");
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      categories: selectedCategories,
      tags: tags,
      price: parseFloat(formData.price) || 0,
      mrp: parseFloat(formData.mrp) || 0,
      tax: formData.tax || "0",
      stock: parseInt(formData.stock) || 0,
      sku: formData.sku,
      isActive: isActive,
      images: images.map((img) => img.url),
      sizes: sizes,
      colors: colors,
      slug: formData.slug,
      metaTitle: formData.metaTitle || "",
      metaDescription: formData.metaDescription || "",
      updatedAt: new Date().toISOString(),
    };

    try {
      toast.loading("Updating product...");
      await updateProduct({ id: productId, productInput: productData }).unwrap();
      toast.dismiss();
      toast.success("✅ Product Updated Successfully");
      router.push("/admin/products");
    } catch (err) {
      toast.dismiss();
      toast.error(err?.data?.message || "❌ Failed to update product");
    }
  };

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData.categories);
    }
  }, [categoriesData]);

  const buildCategoryTree = (categories) => {
    const categoryMap = new Map();
    const rootCategories = [];
    (categories || []).forEach((category) => {
      categoryMap.set(category._id, { ...category, children: [] });
    });
    (categories || []).forEach((category) => {
      if (category.parent) {
        const parent = categoryMap.get(category.parent);
        if (parent) parent.children.push(categoryMap.get(category._id));
      } else {
        rootCategories.push(categoryMap.get(category._id));
      }
    });
    return rootCategories;
  };

  const renderCategoryTree = (tree, level = 0) => {
    return (tree || []).map((category) => (
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

  if (isLoading) {
    return <div className="container mx-auto py-6 px-4 lg:px-6">Loading...</div>;
  }
  if (isError || !productResponse?.product) {
    return <div className="container mx-auto py-6 px-4 lg:px-6">Failed to load product.</div>;
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
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground mt-2">Update product with all the necessary details</p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Basic information about your product</CardDescription>
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
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP</Label>
                  <Input
                    id="mrp"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.mrp}
                    onChange={(e) => handleInputChange("mrp", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    placeholder="Unique SKU"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    required
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="seo-friendly-slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Meta title"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Input
                    id="metaDescription"
                    placeholder="Meta description"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Select one or more categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.categories && (
                <p className="text-sm text-red-500">{errors.categories}</p>
              )}
              <div className="space-y-2 max-h-64 overflow-auto border rounded-md p-3">
                {categoriesData?.categories?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories available</p>
                ) : (
                  <div className="space-y-3">
                    {buildCategoryTree(categoriesData?.categories).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No categories available</p>
                    ) : (
                      renderCategoryTree(buildCategoryTree(categoriesData?.categories))
                    )}
                  </div>
                )}
              </div>
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedCategories.map((categoryId) => {
                    const category = categoriesData?.categories?.find((cat) => cat._id === categoryId);
                    const parentCategory = category?.parent
                      ? categoriesData?.categories?.find((cat) => cat._id === category.parent)
                      : null;
                    return (
                      <Badge key={categoryId} variant="secondary" className="text-xs">
                        {parentCategory ? (
                          <span className="text-muted-foreground">{parentCategory.name} → {category?.name}</span>
                        ) : (
                          category?.name
                        )}
                        <button type="button" onClick={() => handleCategoryToggle(categoryId)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Upload product images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <Input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </div>
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.length === 0 && (
                <div className="col-span-full flex items-center justify-center text-muted-foreground py-6 border rounded-md">
                  <ImageIcon className="h-5 w-5 mr-2" /> No images uploaded
                </div>
              )}
              {images.map((img, idx) => (
                <div key={idx} className="relative border rounded-md overflow-hidden">
                  <img src={img.preview || img.url} alt="product" className="aspect-square object-cover w-full" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add tags to classify the product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tag and press +"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>Control if the product is active</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Toggle product availability</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdatingProduct}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
