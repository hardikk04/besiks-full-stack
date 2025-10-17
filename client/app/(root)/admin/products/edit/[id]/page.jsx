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
import { Plus, X, Upload, ImageIcon, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const EditProductPage = () => {
  const router = useRouter();
  const {id} = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    salePrice: "",
    mrp: "",
    tax: "",
    stock: "",
    sku: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock function to load product data - replace with your API call
  useEffect(() => {
    const loadProductData = async () => {
      if (!id) {
        router.push("/admin/products");
        return;
      }

      try {
        setLoading(true);

        // Mock data - replace with actual API call
        // const response = await fetch(`/api/products/${productId}`);
        // const productData = await response.json();

        // Mock product data for demonstration
        const mockProductData = {
          id: id,
          name: "Sample Product",
          description: "This is a sample product description for editing demo.",
          category: "electronics",
          salePrice: "99.99",
          mrp: "129.99",
          tax: "18",
          stock: "50",
          sku: "SKU-001",
          slug: "sample-product",
          metaTitle: "Sample Product - Best Quality",
          metaDescription:
            "High quality sample product with amazing features and great value for money.",
          tags: ["electronics", "gadgets", "featured"],
          images: [
            {
              name: "product-image-1.jpg",
              url: "/placeholder.jpg",
              isPrimary: true,
            },
          ],
          status: "active",
        };

        // Populate form with existing data
        setFormData({
          name: mockProductData.name,
          description: mockProductData.description,
          category: mockProductData.category,
          salePrice: mockProductData.salePrice,
          mrp: mockProductData.mrp,
          tax: mockProductData.tax,
          stock: mockProductData.stock,
          sku: mockProductData.sku,
          slug: mockProductData.slug,
          metaTitle: mockProductData.metaTitle,
          metaDescription: mockProductData.metaDescription,
        });
        setTags(mockProductData.tags);
        setImages(mockProductData.images);
        setIsActive(mockProductData.status === "active");
      } catch (error) {
        console.error("Error loading product:", error);
        alert("Error loading product data");
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id, router]);

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

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + images.length > 5) {
      alert("You can only upload up to 5 images");
      return;
    }

    const newImages = files.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) =>
          resolve({
            file,
            url: e.target.result,
            name: file.name,
            isNew: true, // Flag to identify newly uploaded images
          });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then((imageResults) => {
      setImages((prev) => [...prev, ...imageResults]);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.salePrice) newErrors.salePrice = "Sale price is required";
    if (!formData.mrp) newErrors.mrp = "MRP is required";
    if (!formData.stock) newErrors.stock = "Stock is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.slug.trim()) newErrors.slug = "URL slug is required";

    // Price validation
    if (formData.salePrice && formData.mrp) {
      if (parseFloat(formData.salePrice) > parseFloat(formData.mrp)) {
        newErrors.salePrice = "Sale price cannot be higher than MRP";
      }
    }

    // Image validation
    if (images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("❌ Form validation failed:", errors);
      return;
    }

    // Prepare complete product data for update
    const productData = {
      id: productId,
      // Basic Information
      name: formData.name,
      description: formData.description,
      category: formData.category,
      tags: tags,

      // Pricing
      salePrice: parseFloat(formData.salePrice) || 0,
      mrp: parseFloat(formData.mrp) || 0,
      tax: formData.tax || "0",

      // Inventory
      stock: parseInt(formData.stock) || 0,
      sku: formData.sku,
      status: isActive ? "active" : "draft",

      // Images (separate new uploads from existing ones)
      images: images.map((img, index) => ({
        name: img.name,
        url: img.url,
        size: img.file?.size,
        type: img.file?.type,
        isPrimary: index === 0,
        isNew: img.isNew || false, // Flag for new images
        file: img.file || null,
      })),

      // SEO
      slug: formData.slug,
      metaTitle: formData.metaTitle || "",
      metaDescription: formData.metaDescription || "",

      // Timestamps
      updatedAt: new Date().toISOString(),
    };

    // Log complete product data for API integration
    console.log("🚀 Product Update Data Ready for API:", productData);
    console.log("📊 Product Update Summary:", {
      id: productData.id,
      name: productData.name,
      category: productData.category,
      price: productData.salePrice,
      stock: productData.stock,
      images: productData.images.length,
      tags: productData.tags.length,
      status: productData.status,
      newImages: productData.images.filter((img) => img.isNew).length,
    });

    // You can now send this data to your API
    // Example: await updateProduct(productId, productData);

    alert("Product updated successfully!");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
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
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground mt-2">
          Update product information and settings
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
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
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
                          src={image.url}
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
                        {image.isNew && (
                          <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            New
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
                <Label htmlFor="salePrice">Sale Price *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) =>
                    handleInputChange("salePrice", e.target.value)
                  }
                  required
                />
                {errors.salePrice && (
                  <p className="text-sm text-red-500">{errors.salePrice}</p>
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
          <Button type="submit">Update Product</Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
