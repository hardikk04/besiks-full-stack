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
import { Plus, X, Percent, DollarSign, Calendar, Users, Package, Tag, Info, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetAllCategoriesQuery } from "@/features/category/categoryApi";
import { useGetAllProductsQuery } from "@/features/products/productApi";
import { useGetCouponByIdQuery, useUpdateDiscountMutation } from "@/features/discount/discountApi";
import { toast } from "sonner";

const EditDiscountPage = () => {
  const router = useRouter();
  const params = useParams();
  const couponId = useMemo(() => params?.id, [params]);

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

  const { data: categoriesRes } = useGetAllCategoriesQuery();
  const { data: productsRes } = useGetAllProductsQuery();
  const { data: couponRes, isLoading } = useGetCouponByIdQuery(couponId, { skip: !couponId });
  const [updateDiscount, { isLoading: isUpdating }] = useUpdateDiscountMutation();

  useEffect(() => {
    if (couponRes?.data) {
      const c = couponRes.data;
      setFormData({
        code: c.code || "",
        name: c.name || "",
        description: c.description || "",
        discountType: c.discountType || "",
        discountValue: (c.discountValue ?? "").toString(),
        minimumOrderAmount: (c.minimumOrderAmount ?? 0).toString(),
        maximumDiscount: (c.maximumDiscount ?? "").toString(),
        validFrom: c.validFrom ? new Date(c.validFrom).toISOString().slice(0,16) : "",
        validUntil: c.validUntil ? new Date(c.validUntil).toISOString().slice(0,16) : "",
        usageLimit: (c.usageLimit ?? "").toString(),
        userUsageLimit: (c.userUsageLimit ?? 1).toString(),
      });
      setIsActive(Boolean(c.isActive));
      setIsFirstTimeUser(Boolean(c.isFirstTimeUser));
      setIsNewUser(Boolean(c.isNewUser));
      setHasUsageLimit(!!c.usageLimit);
      setHasMaxDiscount(!!c.maximumDiscount);
      setApplicableCategories(c.applicableCategories || []);
      setApplicableProducts(c.applicableProducts || []);
      setExcludedCategories(c.excludedCategories || []);
      setExcludedProducts(c.excludedProducts || []);
    }
  }, [couponRes]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "name" && !formData.code) {
      const generatedCode = value.toUpperCase().replace(/[^A-Z0-9\s]/g, "").replace(/\s+/g, "").substring(0, 20);
      setFormData((prev) => ({ ...prev, code: generatedCode }));
    }
  };

  const handleCategoryToggle = (categoryId, type) => {
    const setterMap = { applicable: setApplicableCategories, excluded: setExcludedCategories };
    const setter = setterMap[type];
    setter((prev) => prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]);
  };
  const handleProductToggle = (productId, type) => {
    const setterMap = { applicable: setApplicableProducts, excluded: setExcludedProducts };
    const setter = setterMap[type];
    setter((prev) => prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]);
  };

  const buildCategoryTree = (categories) => {
    const map = new Map();
    const roots = [];
    categories?.forEach((c) => map.set(c._id, { ...c, children: [] }));
    categories?.forEach((c) => {
      if (c.parent) {
        const p = map.get(c.parent);
        if (p) p.children.push(map.get(c._id));
      } else {
        roots.push(map.get(c._id));
      }
    });
    return roots;
  };
  const renderCategoryTree = (cats, type, level = 0) => {
    const selected = type === "applicable" ? applicableCategories : excludedCategories;
    return cats.map((category) => (
      <div key={category._id} className="space-y-1">
        <div className={`flex items-center space-x-2 py-1 px-2 rounded-sm hover:bg-muted/50 ${level === 0 ? "bg-muted/20" : ""}`} style={{ marginLeft: `${level * 16}px` }}>
          <Checkbox id={`${type}-cat-${category._id}`} checked={selected.includes(category._id)} onCheckedChange={() => handleCategoryToggle(category._id, type)} />
          <Label htmlFor={`${type}-cat-${category._id}`} className={`text-sm cursor-pointer flex items-center gap-1 flex-1 ${level === 0 ? "font-medium" : "font-normal text-muted-foreground"}`}>
            {category.name}
            {level === 0 && category.children?.length > 0 && (
              <span className="text-xs text-muted-foreground ml-auto bg-muted px-1.5 py-0.5 rounded">{category.children.length} subcategories</span>
            )}
          </Label>
        </div>
        {category.children?.length > 0 && (
          <div className="ml-2 border-l border-muted pl-2">{renderCategoryTree(category.children, type, level + 1)}</div>
        )}
      </div>
    ));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = "Coupon code is required";
    if (!formData.name.trim()) newErrors.name = "Coupon name is required";
    if (!formData.discountType) newErrors.discountType = "Discount type is required";
    if (!formData.discountValue) newErrors.discountValue = "Discount value is required";
    if (!formData.validFrom) newErrors.validFrom = "Valid from date is required";
    if (!formData.validUntil) newErrors.validUntil = "Valid until date is required";
    if (formData.code && formData.code.length > 20) newErrors.code = "Coupon code cannot be more than 20 characters";
    if (formData.name && formData.name.length > 100) newErrors.name = "Coupon name cannot be more than 100 characters";
    if (formData.description && formData.description.length > 500) newErrors.description = "Description cannot be more than 500 characters";
    if (formData.discountValue && parseFloat(formData.discountValue) < 0) newErrors.discountValue = "Discount value cannot be negative";
    if (formData.discountType === "percentage" && parseFloat(formData.discountValue) > 100) newErrors.discountValue = "Percentage discount cannot exceed 100%";
    if (formData.validFrom && formData.validUntil) {
      const fromDate = new Date(formData.validFrom);
      const untilDate = new Date(formData.validUntil);
      if (fromDate >= untilDate) newErrors.validUntil = "Valid until date must be after valid from date";
    }
    if (hasUsageLimit && formData.usageLimit && parseInt(formData.usageLimit) < 1) newErrors.usageLimit = "Usage limit must be at least 1";
    if (formData.userUsageLimit && parseInt(formData.userUsageLimit) < 1) newErrors.userUsageLimit = "User usage limit must be at least 1";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }
    const discountInput = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || "",
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minimumOrderAmount: Number(formData.minimumOrderAmount) || 0,
      ...(hasMaxDiscount && formData.maximumDiscount !== "" && { maximumDiscount: Number(formData.maximumDiscount) }),
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      ...(hasUsageLimit && formData.usageLimit !== "" && { usageLimit: Number(formData.usageLimit) }),
      userUsageLimit: Number(formData.userUsageLimit) || 1,
      applicableCategories,
      applicableProducts,
      excludedCategories,
      excludedProducts,
      isActive: Boolean(isActive),
      isFirstTimeUser: Boolean(isFirstTimeUser),
      isNewUser: Boolean(isNewUser),
    };

    try {
      toast.loading("Updating discount coupon...");
      await updateDiscount({ id: couponId, discountInput }).unwrap();
      toast.dismiss();
      toast.success("✅ Discount coupon updated successfully");
      router.push("/admin/discount");
    } catch (err) {
      toast.dismiss();
      toast.error(err?.data?.message || "❌ Failed to update discount coupon");
    }
  };

  const categories = categoriesRes?.categories || [];
  const categoryTree = buildCategoryTree(categories);
  const products = productsRes?.products || [];

  if (isLoading) {
    return <div className="container mx-auto py-6 px-4 lg:px-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 lg:px-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Discount Coupon</h1>
          <p className="text-muted-foreground mt-2">Update discount coupon details</p>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" />Basic Information</CardTitle>
              <CardDescription>Basic details about the coupon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input id="code" placeholder="SAVE20" value={formData.code} onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())} maxLength={20} required />
                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                <p className="text-xs text-muted-foreground">Maximum 20 characters ({formData.code.length}/20)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Coupon Name *</Label>
                <Input id="name" placeholder="Save 20% on Electronics" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} maxLength={100} required />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                <p className="text-xs text-muted-foreground">Maximum 100 characters ({formData.name.length}/100)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Special discount for electronics category" rows={3} value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} maxLength={500} />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                <p className="text-xs text-muted-foreground">Maximum 500 characters ({formData.description.length}/500)</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5" />Discount Details</CardTitle>
              <CardDescription>Configure discount type and amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select value={formData.discountType} onValueChange={(value) => handleInputChange("discountType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage"><div className="flex items-center gap-2"><Percent className="h-4 w-4" />Percentage</div></SelectItem>
                    <SelectItem value="fixed"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Fixed Amount</div></SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType && <p className="text-sm text-red-500">{errors.discountType}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}</Label>
                <Input id="discountValue" type="number" placeholder={formData.discountType === "percentage" ? "20" : "50.00"} step={formData.discountType === "percentage" ? "1" : "0.01"} value={formData.discountValue} onChange={(e) => handleInputChange("discountValue", e.target.value)} required />
                {errors.discountValue && <p className="text-sm text-red-500">{errors.discountValue}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrderAmount">Minimum Order Amount</Label>
                <Input id="minimumOrderAmount" type="number" placeholder="0.00" step="0.01" value={formData.minimumOrderAmount} onChange={(e) => handleInputChange("minimumOrderAmount", e.target.value)} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="hasMaxDiscount" checked={hasMaxDiscount} onCheckedChange={setHasMaxDiscount} />
                  <Label htmlFor="hasMaxDiscount">Set Maximum Discount Limit</Label>
                </div>
                {hasMaxDiscount && (
                  <div className="space-y-2">
                    <Label htmlFor="maximumDiscount">Maximum Discount</Label>
                    <Input id="maximumDiscount" type="number" placeholder="100.00" step="0.01" value={formData.maximumDiscount} onChange={(e) => handleInputChange("maximumDiscount", e.target.value)} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Validity Period</CardTitle>
            <CardDescription>Set when this coupon is valid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input id="validFrom" type="datetime-local" value={formData.validFrom} onChange={(e) => handleInputChange("validFrom", e.target.value)} required />
                {errors.validFrom && <p className="text-sm text-red-500">{errors.validFrom}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until *</Label>
                <Input id="validUntil" type="datetime-local" value={formData.validUntil} onChange={(e) => handleInputChange("validUntil", e.target.value)} required />
                {errors.validUntil && <p className="text-sm text-red-500">{errors.validUntil}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Usage Limits & User Restrictions</CardTitle>
            <CardDescription>Control how many times this coupon can be used</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="hasUsageLimit" checked={hasUsageLimit} onCheckedChange={setHasUsageLimit} />
                <Label htmlFor="hasUsageLimit">Set Total Usage Limit</Label>
              </div>
              {hasUsageLimit && (
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input id="usageLimit" type="number" placeholder="100" min="1" value={formData.usageLimit} onChange={(e) => handleInputChange("usageLimit", e.target.value)} />
                  {errors.usageLimit && <p className="text-sm text-red-500">{errors.usageLimit}</p>}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="userUsageLimit">Per User Usage Limit</Label>
              <Input id="userUsageLimit" type="number" placeholder="1" min="1" value={formData.userUsageLimit} onChange={(e) => handleInputChange("userUsageLimit", e.target.value)} />
              {errors.userUsageLimit && <p className="text-sm text-red-500">{errors.userUsageLimit}</p>}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">User Type Restrictions</h4>
              <div className="flex items-center space-x-2">
                <Checkbox id="isFirstTimeUser" checked={isFirstTimeUser} onCheckedChange={setIsFirstTimeUser} />
                <Label htmlFor="isFirstTimeUser">First-time users only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isNewUser" checked={isNewUser} onCheckedChange={setIsNewUser} />
                <Label htmlFor="isNewUser">New users only (max 1 previous order)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Applicable Items</CardTitle>
              <CardDescription>Select categories/products this coupon applies to (leave empty for all)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Categories</Label>
                <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                  {categoryTree.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No categories available</p>
                  ) : (
                    <div className="space-y-2">{renderCategoryTree(categoryTree, "applicable")}</div>
                  )}
                </div>
                {applicableCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {applicableCategories.map((categoryId) => {
                      const category = categories.find((cat) => cat._id === categoryId);
                      const parentCategory = category?.parent ? categories.find((cat) => cat._id === category.parent) : null;
                      return (
                        <Badge key={categoryId} variant="secondary" className="text-xs">
                          {parentCategory ? (
                            <span className="text-muted-foreground">{parentCategory.name} → {category?.name}</span>
                          ) : (
                            category?.name
                          )}
                          <button type="button" onClick={() => handleCategoryToggle(categoryId, "applicable")} className="ml-1 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><X className="h-5 w-5" />Excluded Items</CardTitle>
              <CardDescription>Select categories/products to exclude from this coupon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Categories</Label>
                <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                  {categoryTree.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No categories available</p>
                  ) : (
                    <div className="space-y-2">{renderCategoryTree(categoryTree, "excluded")}</div>
                  )}
                </div>
                {excludedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {excludedCategories.map((categoryId) => {
                      const category = categories.find((cat) => cat._id === categoryId);
                      const parentCategory = category?.parent ? categories.find((cat) => cat._id === category.parent) : null;
                      return (
                        <Badge key={categoryId} variant="destructive" className="text-xs">
                          {parentCategory ? (
                            <span>{parentCategory.name} → {category?.name}</span>
                          ) : (
                            category?.name
                          )}
                          <button type="button" onClick={() => handleCategoryToggle(categoryId, "excluded")} className="ml-1 hover:text-red-300">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdating}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditDiscountPage;


