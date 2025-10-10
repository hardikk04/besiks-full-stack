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
import {
  Plus,
  X,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Package,
  Tag,
  Info,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateDiscountMutation } from "@/features/discount/discountApi";
import { useGetAllCategoriesQuery } from "@/features/category/categoryApi";
import { toast } from "sonner";

const AddDiscountPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "",
    discountValue: "",
    minimumOrderAmount: "0",
    maximumDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    userUsageLimit: "1",
  });

  const [isActive, setIsActive] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasUsageLimit, setHasUsageLimit] = useState(false);
  const [hasMaxDiscount, setHasMaxDiscount] = useState(false);

  const [applicableCategories, setApplicableCategories] = useState([]);
  const [applicableProducts, setApplicableProducts] = useState([]);
  const [excludedCategories, setExcludedCategories] = useState([]);
  const [excludedProducts, setExcludedProducts] = useState([]);

  const [errors, setErrors] = useState({});

  const [createDiscount, { isLoading: isCreatingDiscount, isError }] =
    useCreateDiscountMutation();

  // Mock data for categories and products - replace with your actual data
  const mockCategories = [
    { _id: "cat1", name: "Electronics" },
    { _id: "cat2", name: "Clothing" },
    { _id: "cat3", name: "Home & Garden" },
    { _id: "cat4", name: "Books" },
    { _id: "cat5", name: "Sports" },
  ];

  const mockProducts = [
    { _id: "prod1", name: "Wireless Headphones" },
    { _id: "prod2", name: "Smart Phone" },
    { _id: "prod3", name: "Laptop" },
    { _id: "prod4", name: "T-Shirt" },
    { _id: "prod5", name: "Running Shoes" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Auto-generate code from name
    if (field === "name" && !formData.code) {
      const generatedCode = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "")
        .replace(/\s+/g, "")
        .substring(0, 20);
      setFormData((prev) => ({ ...prev, code: generatedCode }));
    }
  };

  const handleCategoryToggle = (categoryId, type) => {
    const setterMap = {
      applicable: setApplicableCategories,
      excluded: setExcludedCategories,
    };

    const setter = setterMap[type];
    setter((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleProductToggle = (productId, type) => {
    const setterMap = {
      applicable: setApplicableProducts,
      excluded: setExcludedProducts,
    };

    const setter = setterMap[type];
    setter((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

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
  const renderCategoryTree = (categories, type, level = 0) => {
    const selectedCategories =
      type === "applicable" ? applicableCategories : excludedCategories;

    return categories.map((category) => (
      <div key={category._id} className="space-y-1">
        <div
          className={`flex items-center space-x-2 py-1 px-2 rounded-sm hover:bg-muted/50 ${
            level === 0 ? "bg-muted/20" : ""
          }`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          <Checkbox
            id={`${type}-cat-${category._id}`}
            checked={selectedCategories.includes(category._id)}
            onCheckedChange={() => handleCategoryToggle(category._id, type)}
          />
          <Label
            htmlFor={`${type}-cat-${category._id}`}
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
            {renderCategoryTree(category.children, type, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.code.trim()) newErrors.code = "Coupon code is required";
    if (!formData.name.trim()) newErrors.name = "Coupon name is required";
    if (!formData.discountType)
      newErrors.discountType = "Discount type is required";
    if (!formData.discountValue)
      newErrors.discountValue = "Discount value is required";
    if (!formData.validFrom)
      newErrors.validFrom = "Valid from date is required";
    if (!formData.validUntil)
      newErrors.validUntil = "Valid until date is required";

    // Code validation
    if (formData.code && formData.code.length > 20) {
      newErrors.code = "Coupon code cannot be more than 20 characters";
    }

    // Name validation
    if (formData.name && formData.name.length > 100) {
      newErrors.name = "Coupon name cannot be more than 100 characters";
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description cannot be more than 500 characters";
    }

    // Discount value validation
    if (formData.discountValue && parseFloat(formData.discountValue) < 0) {
      newErrors.discountValue = "Discount value cannot be negative";
    }

    // Percentage validation
    if (
      formData.discountType === "percentage" &&
      parseFloat(formData.discountValue) > 100
    ) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }

    // Date validation
    if (formData.validFrom && formData.validUntil) {
      const fromDate = new Date(formData.validFrom);
      const untilDate = new Date(formData.validUntil);
      if (fromDate >= untilDate) {
        newErrors.validUntil = "Valid until date must be after valid from date";
      }
    }

    // Usage limit validation
    if (
      hasUsageLimit &&
      formData.usageLimit &&
      parseInt(formData.usageLimit) < 1
    ) {
      newErrors.usageLimit = "Usage limit must be at least 1";
    }

    // User usage limit validation
    if (formData.userUsageLimit && parseInt(formData.userUsageLimit) < 1) {
      newErrors.userUsageLimit = "User usage limit must be at least 1";
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

    // Prepare coupon data with correct types for backend
    const couponData = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || "",
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minimumOrderAmount: Number(formData.minimumOrderAmount) || 0,
      // Only include maximumDiscount if set
      ...(hasMaxDiscount &&
        formData.maximumDiscount !== "" && {
          maximumDiscount: Number(formData.maximumDiscount),
        }),
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      // Only include usageLimit if set
      ...(hasUsageLimit &&
        formData.usageLimit !== "" && {
          usageLimit: Number(formData.usageLimit),
        }),
      usageCount: 0,
      userUsageLimit: Number(formData.userUsageLimit) || 1,
      applicableCategories: applicableCategories,
      applicableProducts: applicableProducts,
      excludedCategories: excludedCategories,
      excludedProducts: excludedProducts,
      isActive: Boolean(isActive),
      isFirstTimeUser: Boolean(isFirstTimeUser),
      isNewUser: Boolean(isNewUser),
      // timestamps handled by backend
    };

    // Log complete coupon data for API integration
    console.log("🎯 Coupon Data Ready for API:", couponData);
    console.log("📊 Coupon Summary:", {
      code: couponData.code,
      name: couponData.name,
      discountType: couponData.discountType,
      discountValue: couponData.discountValue,
      validityDays: Math.ceil(
        (new Date(couponData.validUntil) - new Date(couponData.validFrom)) /
          (1000 * 60 * 60 * 24)
      ),
      usageLimit: couponData.usageLimit || "Unlimited",
      restrictions: {
        firstTimeUser: couponData.isFirstTimeUser,
        newUser: couponData.isNewUser,
        categories: applicableCategories.length,
        products: applicableProducts.length,
      },
      status: couponData.isActive ? "Active" : "Inactive",
    });

    try {
      // Show loading toast
      toast.loading("Creating discount coupon...");

      await createDiscount(couponData).unwrap();

      toast.dismiss();
      toast.success("✅ Discount coupon created successfully");

      router.push("/admin/discount");
    } catch (err) {
      console.error("❌ Discount creation failed:", err);
      toast.dismiss();
      toast.error(err?.data?.message || "❌ Failed to create discount coupon");
    }
  };

  const { data: allCategories, error, isSuccess } = useGetAllCategoriesQuery();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (allCategories) {
      setCategories(allCategories.categories);
    }
  }, [allCategories]);

  const categoryTree = buildCategoryTree(categories);

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
        <div>
          <h1 className="text-3xl font-bold">Add Discount Coupon</h1>
          <p className="text-muted-foreground mt-2">
            Create new discount coupons to offer to your customers
          </p>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Basic details about the coupon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  placeholder="SAVE20"
                  value={formData.code}
                  onChange={(e) =>
                    handleInputChange("code", e.target.value.toUpperCase())
                  }
                  maxLength={20}
                  required
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum 20 characters ({formData.code.length}/20)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  placeholder="Save 20% on Electronics"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  maxLength={100}
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum 100 characters ({formData.name.length}/100)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Special discount for electronics category"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  maxLength={500}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum 500 characters ({formData.description.length}/500)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Discount Details
              </CardTitle>
              <CardDescription>
                Configure discount type and amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) =>
                    handleInputChange("discountType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Percentage
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Fixed Amount
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType && (
                  <p className="text-sm text-red-500">{errors.discountType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value *{" "}
                  {formData.discountType === "percentage" ? "(%)" : "(₹)"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  placeholder={
                    formData.discountType === "percentage" ? "20" : "50.00"
                  }
                  step={formData.discountType === "percentage" ? "1" : "0.01"}
                  value={formData.discountValue}
                  onChange={(e) =>
                    handleInputChange("discountValue", e.target.value)
                  }
                  required
                />
                {errors.discountValue && (
                  <p className="text-sm text-red-500">{errors.discountValue}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumOrderAmount">Minimum Order Amount</Label>
                <Input
                  id="minimumOrderAmount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.minimumOrderAmount}
                  onChange={(e) =>
                    handleInputChange("minimumOrderAmount", e.target.value)
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMaxDiscount"
                    checked={hasMaxDiscount}
                    onCheckedChange={setHasMaxDiscount}
                  />
                  <Label htmlFor="hasMaxDiscount">
                    Set Maximum Discount Limit
                  </Label>
                </div>
                {hasMaxDiscount && (
                  <div className="space-y-2">
                    <Label htmlFor="maximumDiscount">Maximum Discount</Label>
                    <Input
                      id="maximumDiscount"
                      type="number"
                      placeholder="100.00"
                      step="0.01"
                      value={formData.maximumDiscount}
                      onChange={(e) =>
                        handleInputChange("maximumDiscount", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Validity Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Validity Period
            </CardTitle>
            <CardDescription>Set when this coupon is valid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) =>
                    handleInputChange("validFrom", e.target.value)
                  }
                  required
                />
                {errors.validFrom && (
                  <p className="text-sm text-red-500">{errors.validFrom}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until *</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) =>
                    handleInputChange("validUntil", e.target.value)
                  }
                  required
                />
                {errors.validUntil && (
                  <p className="text-sm text-red-500">{errors.validUntil}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Usage Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usage Limits & User Restrictions
            </CardTitle>
            <CardDescription>
              Control how many times this coupon can be used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasUsageLimit"
                  checked={hasUsageLimit}
                  onCheckedChange={setHasUsageLimit}
                />
                <Label htmlFor="hasUsageLimit">Set Total Usage Limit</Label>
              </div>
              {hasUsageLimit && (
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="100"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      handleInputChange("usageLimit", e.target.value)
                    }
                  />
                  {errors.usageLimit && (
                    <p className="text-sm text-red-500">{errors.usageLimit}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userUsageLimit">Per User Usage Limit</Label>
              <Input
                id="userUsageLimit"
                type="number"
                placeholder="1"
                min="1"
                value={formData.userUsageLimit}
                onChange={(e) =>
                  handleInputChange("userUsageLimit", e.target.value)
                }
              />
              {errors.userUsageLimit && (
                <p className="text-sm text-red-500">{errors.userUsageLimit}</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">User Type Restrictions</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFirstTimeUser"
                  checked={isFirstTimeUser}
                  onCheckedChange={setIsFirstTimeUser}
                />
                <Label htmlFor="isFirstTimeUser">First-time users only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNewUser"
                  checked={isNewUser}
                  onCheckedChange={setIsNewUser}
                />
                <Label htmlFor="isNewUser">
                  New users only (max 1 previous order)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Product/Category Restrictions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Applicable Items
              </CardTitle>
              <CardDescription>
                Select categories/products this coupon applies to (leave empty
                for all)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Categories</Label>
                <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                  {categoryTree.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No categories available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {renderCategoryTree(categoryTree, "applicable")}
                    </div>
                  )}
                </div>
                {applicableCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {applicableCategories.map((categoryId) => {
                      const category = categories.find(
                        (cat) => cat._id === categoryId
                      );
                      const parentCategory = category?.parent
                        ? categories.find((cat) => cat._id === category.parent)
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
                            onClick={() =>
                              handleCategoryToggle(categoryId, "applicable")
                            }
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Select categories this discount applies to (
                  {applicableCategories.length} selected)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <X className="h-5 w-5" />
                Excluded Items
              </CardTitle>
              <CardDescription>
                Select categories/products to exclude from this coupon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Categories</Label>
                <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                  {categoryTree.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No categories available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {renderCategoryTree(categoryTree, "excluded")}
                    </div>
                  )}
                </div>
                {excludedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {excludedCategories.map((categoryId) => {
                      const category = categories.find(
                        (cat) => cat._id === categoryId
                      );
                      const parentCategory = category?.parent
                        ? categories.find((cat) => cat._id === category.parent)
                        : null;

                      return (
                        <Badge
                          key={categoryId}
                          variant="destructive"
                          className="text-xs"
                        >
                          {parentCategory ? (
                            <span>
                              {parentCategory.name} → {category?.name}
                            </span>
                          ) : (
                            category?.name
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              handleCategoryToggle(categoryId, "excluded")
                            }
                            className="ml-1 hover:text-red-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Select categories to exclude from this discount (
                  {excludedCategories.length} selected)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Summary & Submit */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Info className="h-5 w-5" />
              Coupon Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <p>
                <strong>Code:</strong> {formData.code || "Not set"}
              </p>
              <p>
                <strong>Name:</strong> {formData.name || "Not set"}
              </p>
              <p>
                <strong>Type:</strong>{" "}
                {formData.discountType
                  ? formData.discountType === "percentage"
                    ? `${formData.discountValue}% off`
                    : `₹${formData.discountValue} off`
                  : "Not set"}
              </p>
              <p>
                <strong>Min. Order:</strong> ₹
                {formData.minimumOrderAmount || "0"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddDiscountPage;
