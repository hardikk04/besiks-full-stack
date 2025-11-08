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
import { Plus, X, Upload, ImageIcon, ArrowLeft, Check, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateProductMutation } from "@/features/products/productApi";
import { useGetAllCategoriesQuery } from "@/features/category/categoryApi";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/hooks/uploadImage";
import { getColorNameFromHex, isValidHex } from "@/lib/colorUtils";
import slugify from "slugify";

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
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [productType, setProductType] = useState("simple"); // "simple" or "variable"
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState([]); // {name, value}
  const [colorName, setColorName] = useState("");
  const [colorValue, setColorValue] = useState("#000000");
  const [colorHexInput, setColorHexInput] = useState("");
  const [autoFillName, setAutoFillName] = useState(true); // Auto-fill color name from hex
  
  // Variable product state
  const [variantOptions, setVariantOptions] = useState([]); // [{name: "Color", values: ["Red", "Blue"]}]
  const [variants, setVariants] = useState([]); // [{options: {Color: "Red", Size: "M"}, price, stock, sku, image}]
  const [selectedVariants, setSelectedVariants] = useState(new Set()); // For bulk selection
  const [bulkEditField, setBulkEditField] = useState(null); // 'price', 'mrp', 'stock', 'sku'
  const manuallyRemovedVariantsRef = useRef(new Set()); // Track manually removed variant option combinations

  const [
    createProduct,
    { isLoading: isLoadingProduct, isError: isCreatingProductError },
  ] = useCreateProductMutation();

  // Handle color picker change - auto-fill name if enabled
  const handleColorPickerChange = (hex) => {
    setColorValue(hex);
    setColorHexInput(hex);
    if (autoFillName) {
      const colorName = getColorNameFromHex(hex);
      setColorName(colorName);
    }
  };

  // Handle hex input change - update picker and auto-fill name if enabled
  const handleHexInputChange = (value) => {
    setColorHexInput(value);
    
    // If valid hex, update color picker
    if (isValidHex(value)) {
      // Normalize hex (add # if missing)
      const normalizedHex = value.startsWith('#') ? value : '#' + value;
      setColorValue(normalizedHex);
      
      // Auto-fill name if enabled
      if (autoFillName) {
        const colorName = getColorNameFromHex(normalizedHex);
        setColorName(colorName);
      }
    }
  };

  // Handle color name manual change - disable auto-fill temporarily
  const handleColorNameChange = (value) => {
    setColorName(value);
    // User is manually typing, don't auto-fill
    setAutoFillName(false);
  };

  // Generate all possible variant combinations from variantOptions
  const generateVariants = (options, existingVariants = []) => {
    if (!options || options.length === 0 || options.some(opt => opt.values.length === 0)) {
      setVariants([]);
      return;
    }

    // Create a map of existing variants by their option combination
    const existingMap = new Map();
    existingVariants.forEach(v => {
      const key = JSON.stringify(v.options);
      existingMap.set(key, v);
    });

    // Generate all combinations
    const combinations = [];
    const generateCombinations = (current, index) => {
      if (index === options.length) {
        combinations.push({ ...current });
        return;
      }
      const option = options[index];
      option.values.forEach(value => {
        generateCombinations(
          { ...current, [option.name]: value },
          index + 1
        );
      });
    };
    generateCombinations({}, 0);

    // Filter out manually removed variants
    const filteredCombinations = combinations.filter(combo => {
      const key = JSON.stringify(combo);
      return !manuallyRemovedVariantsRef.current.has(key);
    });

    // Create variants, preserving existing data where possible
    const newVariants = filteredCombinations.map(combo => {
      const key = JSON.stringify(combo);
      const existing = existingMap.get(key);
      // Handle backward compatibility: convert old 'image' to 'images' array
      let existingImages = existing?.images || [];
      if (existing?.image && !existing?.images) {
        existingImages = [existing.image];
      }
      if (!Array.isArray(existingImages)) {
        existingImages = existingImages ? [existingImages] : [];
      }
      return existing ? {
        ...existing,
        images: existingImages,
        featuredImageIndex: existing.featuredImageIndex || 0
      } : {
        options: combo,
        price: 0,
        mrp: 0,
        stock: 0,
        sku: "",
        images: [],
        featuredImageIndex: 0,
        isActive: true
      };
    });

    setVariants(newVariants);
  };

  // Auto-generate variants when options change (Shopify-style)
  const variantOptionsKey = useMemo(() => 
    variantOptions.map(o => `${o.name}:${o.values.join(',')}`).join('|'),
    [variantOptions]
  );
  
  useEffect(() => {
    if (productType === "variable" && variantOptions.length > 0) {
      const hasAllValues = variantOptions.every(opt => opt.values.length > 0);
      if (hasAllValues) {
        generateVariants(variantOptions, variants);
      } else {
        setVariants([]);
      }
    } else if (productType === "variable" && variantOptions.length === 0) {
      setVariants([]);
    }
  }, [variantOptionsKey, productType]);

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
      // Reset the input so the same file can be selected again
      event.target.value = '';
      return;
    }

    // Check file sizes (limit to 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error("Some images are too large. Please use images under 5MB.");
      // Reset the input so the same file can be selected again
      event.target.value = '';
      return;
    }

    // Check file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      toast.error("Please upload only JPEG, PNG, WebP, or AVIF images");
      // Reset the input so the same file can be selected again
      event.target.value = '';
      return;
    }

    toast.loading("Uploading images...");

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
      
      // Reset the input value so the same file can be selected again
      event.target.value = '';
      
      toast.dismiss();
      toast.success(
        `${uploadedImages.length} image(s) uploaded successfully`
      );
    } catch (error) {
      console.error("Error uploading images:", error);
      // Reset the input even on error so user can try again
      event.target.value = '';
      toast.dismiss();
      toast.error("Failed to upload images. Please try again.");
    }
  };

  const removeImage = (index) => {
    // Clean up the object URL to prevent memory leaks
    const imageToRemove = images[index];
    if (imageToRemove?.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    setImages((prev) => prev.filter((_, i) => i !== index));
    
    // Adjust featured image index if needed
    if (featuredImageIndex === index) {
      // If removing the featured image, set to first image (index 0) or 0 if no images left
      setFeaturedImageIndex(0);
    } else if (featuredImageIndex > index) {
      // If removing an image before the featured one, decrement the index
      setFeaturedImageIndex(featuredImageIndex - 1);
    }
    
    // Reset the file input so the same file can be selected again
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = '';
    }
    
    toast.success("Image removed");
  };

  // Handle variant image upload
  const handleVariantImageUpload = async (variantIndex, event) => {
    const files = Array.from(event.target.files);
    const variant = variants[variantIndex];
    const currentImages = variant?.images || [];
    
    if (files.length + currentImages.length > 5) {
      toast.error("You can only upload up to 5 images per variant");
      event.target.value = '';
      return;
    }

    // Check file sizes (limit to 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error("Some images are too large. Please use images under 5MB.");
      event.target.value = '';
      return;
    }

    // Check file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      toast.error("Please upload only JPEG, PNG, WebP, or AVIF images");
      event.target.value = '';
      return;
    }

    toast.loading(`Uploading images for variant ${variantIndex + 1}...`);

    try {
      const uploadPromises = files.map(async (file) => {
        const imageObj = {
          file: file,
          preview: URL.createObjectURL(file),
          name: file.name,
        };

        const cloudinaryUrl = await uploadToCloudinary(imageObj);

        if (cloudinaryUrl) {
          return cloudinaryUrl;
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      const uploadedImageUrls = await Promise.all(uploadPromises);
      const newVariants = [...variants];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        images: [...(newVariants[variantIndex].images || []), ...uploadedImageUrls]
      };
      setVariants(newVariants);
      
      event.target.value = '';
      toast.dismiss();
      toast.success(`${uploadedImageUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading variant images:", error);
      event.target.value = '';
      toast.dismiss();
      toast.error("Failed to upload images. Please try again.");
    }
  };

  // Remove variant image
  const removeVariantImage = (variantIndex, imageIndex) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];
    const variantImages = variant.images || [];
    const currentFeaturedIndex = variant.featuredImageIndex || 0;
    
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      images: variantImages.filter((_, i) => i !== imageIndex),
      featuredImageIndex: 
        currentFeaturedIndex === imageIndex
          ? 0 // If removing featured image, set to first image
          : currentFeaturedIndex > imageIndex
          ? currentFeaturedIndex - 1 // Adjust index if removing before featured
          : currentFeaturedIndex // Keep same if removing after featured
    };
    setVariants(newVariants);
    toast.success("Image removed");
  };

  // Set variant featured image
  const setVariantFeaturedImage = (variantIndex, imageIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      featuredImageIndex: imageIndex
    };
    setVariants(newVariants);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (selectedCategories.length === 0)
      newErrors.categories = "At least one category is required";
    
    // Validation based on product type
    if (productType === "simple") {
      if (!formData.price) newErrors.price = "Sale price is required";
      if (!formData.mrp) newErrors.mrp = "MRP is required";
      if (!formData.stock && formData.stock !== 0) newErrors.stock = "Stock is required";
      if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    } else if (productType === "variable") {
      if (variantOptions.length === 0) {
        newErrors.variantOptions = "At least one variant attribute is required";
      }
      if (variants.length === 0) {
        newErrors.variants = "At least one variant is required";
      } else {
        // Collect all SKUs for uniqueness check
        const allSkus = [];
        const variantSkus = [];
        
        // Collect variant SKUs
        variants.forEach((variant, index) => {
          if (variant.sku && variant.sku.trim() !== "") {
            const sku = variant.sku.trim();
            variantSkus.push({ sku, index });
            allSkus.push(sku);
          }
        });
        
        // Check for duplicate SKUs within variants
        const duplicateSkus = allSkus.filter((sku, index) => allSkus.indexOf(sku) !== index);
        if (duplicateSkus.length > 0) {
          const uniqueDuplicates = [...new Set(duplicateSkus)];
          uniqueDuplicates.forEach(duplicateSku => {
            variantSkus.forEach(({ sku, index }) => {
              if (sku === duplicateSku) {
                newErrors[`variants.${index}.sku`] = "SKU must be unique";
              }
            });
          });
        }
      }
    }
    
    // Check for duplicate SKU between simple product SKU and variant SKUs
    if (productType === "variable" && formData.sku && formData.sku.trim() !== "") {
      const simpleSku = formData.sku.trim();
      variants.forEach((variant, index) => {
        if (variant.sku && variant.sku.trim() === simpleSku) {
          newErrors.sku = "SKU must be unique (already used in variants)";
          newErrors[`variants.${index}.sku`] = "SKU must be unique (already used in product SKU)";
        }
      });
    }
    // Slug validation - optional since it will be auto-generated
    if (formData.slug) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugPattern.test(formData.slug)) {
        newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
      } else if (formData.slug.length > 200) {
        newErrors.slug = "Slug cannot be more than 200 characters";
      }
    }

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

    // Set errors - this will trigger re-render with highlighted fields
    setErrors(newErrors);
    
    // Scroll to first error field if validation fails
    if (Object.keys(newErrors).length > 0) {
      // Use a longer timeout to ensure React has re-rendered with the new error state
      // This ensures the error classes are applied before we scroll
      setTimeout(() => {
        const firstErrorField = Object.keys(newErrors)[0];
        let errorElement = document.getElementById(firstErrorField);
        
        // If not found by ID, try data-field attribute
        if (!errorElement) {
          errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
        }
        
        // If still not found, try to find the input inside a container with data-field
        if (!errorElement && firstErrorField === 'categories') {
          const container = document.querySelector(`[data-field="categories"]`);
          if (container) {
            errorElement = container;
          }
        } else if (!errorElement && firstErrorField === 'images') {
          const container = document.querySelector(`[data-field="images"]`);
          if (container) {
            errorElement = container;
          }
        } else if (!errorElement && firstErrorField.startsWith('variants.')) {
          // Handle variant field errors
          errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
        }
        
        if (errorElement) {
          // Scroll to the element
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Try to focus if it's an input element
          if (errorElement.tagName === 'INPUT' || errorElement.tagName === 'TEXTAREA' || errorElement.tagName === 'SELECT') {
            setTimeout(() => {
              errorElement.focus();
            }, 400);
          } else if (errorElement.querySelector) {
            // If it's a container, focus the first input inside
            const input = errorElement.querySelector('input, textarea, select');
            if (input) {
              setTimeout(() => {
                input.focus();
              }, 400);
            }
          }
        }
      }, 300);
    }
    
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      // Don't show toast - the highlighted fields are enough feedback
      // The form will scroll to the first error and highlight it
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

      // Images - Server URLs (already uploaded)
      images: images.map((img) => img.url),
      featuredImageIndex: featuredImageIndex,

      // Product type
      productType: productType,

      // Variable product fields only
      variantOptions: productType === "variable" ? variantOptions : undefined,
      variants: productType === "variable" ? variants : undefined,

      // SEO
      slug: formData.slug,
      metaTitle: formData.metaTitle || "",
      metaDescription: formData.metaDescription || "",

      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
      
      // Handle SKU uniqueness errors
      const errorMessage = err?.data?.message || "";
      if (errorMessage.includes("SKU") && (errorMessage.includes("UNIQUE") || errorMessage.includes("unique") || errorMessage.includes("already exist"))) {
        const serverErrors = {};
        
        // Check if it's a variant SKU error
        if (errorMessage.includes("variant") || err?.data?.errors?.variants) {
          // For variant SKU errors, we need to find which variant has the duplicate
          // Since server doesn't tell us which variant, we'll mark all variant SKUs
          // Or we can check the submitted data to find potential duplicates
          if (productType === "variable" && variants) {
            // Check which variant SKUs might be duplicates
            const submittedSkus = variants.map(v => v.sku).filter(sku => sku && sku.trim() !== "");
            const duplicateSkus = submittedSkus.filter((sku, index) => submittedSkus.indexOf(sku) !== index);
            const uniqueDuplicates = [...new Set(duplicateSkus)];
            
            variants.forEach((variant, index) => {
              if (variant.sku && uniqueDuplicates.includes(variant.sku)) {
                serverErrors[`variants.${index}.sku`] = "SKU must be unique";
              }
            });
            
            // If no duplicates found in variants, check if simple SKU conflicts
            if (formData.sku && submittedSkus.includes(formData.sku)) {
              serverErrors.sku = "SKU must be unique";
            }
          }
        } else {
          // Simple product SKU error
          serverErrors.sku = "SKU must be unique";
        }
        
        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
          
          // Scroll to first error field
          setTimeout(() => {
            const firstErrorField = Object.keys(serverErrors)[0];
            let errorElement = document.getElementById(firstErrorField) || 
                              document.querySelector(`[data-field="${firstErrorField}"]`);
            
            if (errorElement) {
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (errorElement.tagName === 'INPUT' || errorElement.tagName === 'TEXTAREA' || errorElement.tagName === 'SELECT') {
                setTimeout(() => errorElement.focus(), 400);
              } else if (errorElement.querySelector) {
                const input = errorElement.querySelector('input, textarea, select');
                if (input) setTimeout(() => input.focus(), 400);
              }
            }
          }, 300);
          return;
        }
      }
      
      // Handle server-side validation errors
      if (err?.data?.errors) {
        // Map server validation errors to form errors
        const serverErrors = {};
        const fieldErrors = err.data.errors;
        
        // Map common field names
        Object.keys(fieldErrors).forEach((key) => {
          if (fieldErrors[key] && fieldErrors[key].length > 0) {
            serverErrors[key] = Array.isArray(fieldErrors[key]) 
              ? fieldErrors[key][0] 
              : fieldErrors[key];
          }
        });
        
        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
          
          // Scroll to first error
          setTimeout(() => {
            const firstErrorField = Object.keys(serverErrors)[0];
            let errorElement = document.getElementById(firstErrorField) || 
                              document.querySelector(`[data-field="${firstErrorField}"]`);
            
            if (errorElement) {
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (errorElement.tagName === 'INPUT' || errorElement.tagName === 'TEXTAREA' || errorElement.tagName === 'SELECT') {
                setTimeout(() => errorElement.focus(), 400);
              } else if (errorElement.querySelector) {
                const input = errorElement.querySelector('input, textarea, select');
                if (input) setTimeout(() => input.focus(), 400);
              }
            }
          }, 300);
          return;
        }
      }
      
      // Show generic error for other failures
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
                <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
                  Product Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                  className={errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories" className={errors.categories ? "text-red-500" : ""}>
                  Categories *
                </Label>
                <div 
                  className={`border rounded-md p-3 max-h-60 overflow-y-auto ${
                    errors.categories ? "border-red-500 bg-red-50/30" : ""
                  }`}
                  data-field="categories"
                >
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
                <Label htmlFor="productType">Product Type *</Label>
                <Select
                  value={productType}
                  onValueChange={(value) => {
                    setProductType(value);
                    // Clear variant-related data when switching to simple
                    if (value === "simple") {
                      setVariantOptions([]);
                      setVariants([]);
                      setSelectedVariants(new Set());
                      setBulkEditField(null);
                      manuallyRemovedVariantsRef.current.clear();
                      // Also clear sizes and colors for simple products
                      setSizes([]);
                      setColors([]);
                      setSizeInput("");
                      setColorName("");
                      setColorValue("#000000");
                      setColorHexInput("");
                    }
                    // Clear errors when switching types
                    if (errors.variantOptions) delete errors.variantOptions;
                    if (errors.variants) delete errors.variants;
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple Product</SelectItem>
                    <SelectItem value="variable">Variable Product</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Simple: Single product with fixed price and stock. Variable: Product with multiple variations (e.g., different colors, sizes).
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
              <CardTitle className={errors.images ? "text-red-500" : ""}>
                Product Images *
              </CardTitle>
              <CardDescription>Upload product images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    errors.images 
                      ? "border-red-500 bg-red-50/50" 
                      : "border-muted-foreground/25"
                  }`}
                  data-field="images"
                >
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
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
                      Upload up to 5 images (JPG, PNG, WebP, AVIF)
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
                          className={`w-full h-24 object-cover rounded-lg border-2 ${
                            featuredImageIndex === index ? "border-blue-500" : "border-gray-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeaturedImageIndex(index)}
                          className={`absolute top-1 left-1 p-1 rounded-full transition-all ${
                            featuredImageIndex === index
                              ? "bg-blue-500 text-white opacity-100"
                              : "bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100"
                          }`}
                          title="Set as featured image"
                        >
                          <Star className={`h-4 w-4 ${featuredImageIndex === index ? "fill-current" : ""}`} />
                        </button>
                        {featuredImageIndex === index && (
                          <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Featured
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
            {productType === "simple" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price" className={errors.price ? "text-red-500" : ""}>
                    Sale Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                    className={errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrp" className={errors.mrp ? "text-red-500" : ""}>
                    MRP (Maximum Retail Price) *
                  </Label>
                  <Input
                    id="mrp"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.mrp}
                    onChange={(e) => handleInputChange("mrp", e.target.value)}
                    required
                    className={errors.mrp ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.mrp && (
                    <p className="text-sm text-red-500">{errors.mrp}</p>
                  )}
                </div>
              </div>
            )}
            {productType === "variable" && (
              <p className="text-sm text-muted-foreground">
                Pricing is managed at the variant level for variable products.
              </p>
            )}

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
            {productType === "simple" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock" className={errors.stock ? "text-red-500" : ""}>
                    Total Stock *
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    required
                    className={errors.stock ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500">{errors.stock}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku" className={errors.sku ? "text-red-500" : ""}>
                    SKU (Stock Keeping Unit) *
                  </Label>
                  <Input
                    id="sku"
                    data-field="sku"
                    placeholder="Enter SKU"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    required
                    className={errors.sku ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku}</p>
                  )}
                </div>
              </div>
            )}
            {productType === "variable" && (
              <p className="text-sm text-muted-foreground">
                Stock and SKU are managed at the variant level for variable products.
              </p>
            )}

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

        {/* Variable Product Section - Shopify Style */}
        {productType === "variable" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className={errors.variantOptions ? "text-red-500" : ""}>
                  Variant Options *
                </CardTitle>
                <CardDescription>
                  Add options like Color, Size, Material. Variants will be created automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {variantOptions.map((option, optionIndex) => (
                    <div key={optionIndex} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-900">
                          {option.name}
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOptions = variantOptions.filter((_, i) => i !== optionIndex);
                            setVariantOptions(newOptions);
                          }}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {option.values.map((value, valueIndex) => (
                          <Badge key={valueIndex} variant="secondary" className="flex items-center gap-1 pr-1 text-xs">
                            {value}
                            <button
                              type="button"
                              className="ml-1 hover:text-red-500 focus:outline-none"
                              onClick={() => {
                                const newOptions = [...variantOptions];
                                newOptions[optionIndex].values = newOptions[optionIndex].values.filter(
                                  (_, i) => i !== valueIndex
                                );
                                setVariantOptions(newOptions);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add value"
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const value = e.target.value.trim();
                              if (value && !option.values.includes(value)) {
                                const newOptions = [...variantOptions];
                                newOptions[optionIndex].values.push(value);
                                setVariantOptions(newOptions);
                                e.target.value = "";
                              } else if (option.values.includes(value)) {
                                toast.error(`${value} already exists`);
                                e.target.value = "";
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            const input = e.target.closest('.flex').querySelector('input');
                            const value = input?.value.trim();
                            if (value && !option.values.includes(value)) {
                              const newOptions = [...variantOptions];
                              newOptions[optionIndex].values.push(value);
                              setVariantOptions(newOptions);
                              if (input) input.value = "";
                            } else if (value && option.values.includes(value)) {
                              toast.error(`${value} already exists`);
                              if (input) input.value = "";
                            }
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="flex gap-2">
                    <Input
                      id="new-attribute-input"
                      placeholder="Option name (e.g., Color, Size)"
                      className="flex-1 h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const name = e.target.value.trim();
                          if (name && !variantOptions.find((o) => o.name === name)) {
                            setVariantOptions([...variantOptions, { name, values: [] }]);
                            e.target.value = "";
                          } else if (variantOptions.find((o) => o.name === name)) {
                            toast.error(`Option "${name}" already exists`);
                            e.target.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        const input = document.getElementById('new-attribute-input');
                        const name = input?.value.trim();
                        if (name && !variantOptions.find((o) => o.name === name)) {
                          setVariantOptions([...variantOptions, { name, values: [] }]);
                          if (input) input.value = "";
                        } else if (name && variantOptions.find((o) => o.name === name)) {
                          toast.error(`Option "${name}" already exists`);
                          if (input) input.value = "";
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Option
                    </Button>
                  </div>
                </div>
                {errors.variantOptions && (
                  <p className="text-sm text-red-500">{errors.variantOptions}</p>
                )}
              </CardContent>
            </Card>

            {/* Variants Table - Shopify Style */}
            {variants.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={errors.variants ? "text-red-500" : ""}>
                        Variants ({variants.length})
                      </CardTitle>
                      <CardDescription>
                        Variants are automatically created from your options
                      </CardDescription>
                    </div>
                    {selectedVariants.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {selectedVariants.size} selected
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setBulkEditField(bulkEditField === 'price' ? null : 'price');
                          }}
                        >
                          Bulk Edit Price
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setBulkEditField(bulkEditField === 'stock' ? null : 'stock');
                          }}
                        >
                          Bulk Edit Stock
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setBulkEditField(bulkEditField === 'mrp' ? null : 'mrp');
                          }}
                        >
                          Bulk Edit MRP
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVariants(new Set())}
                        >
                          Clear Selection
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedVariants.size === variants.length && variants.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedVariants(new Set(variants.map((_, i) => i)));
                                } else {
                                  setSelectedVariants(new Set());
                                }
                              }}
                            />
                          </TableHead>
                          {variantOptions.map((option) => (
                            <TableHead key={option.name} className="min-w-[120px]">
                              {option.name}
                            </TableHead>
                          ))}
                          <TableHead className="min-w-[100px]">Price *</TableHead>
                          <TableHead className="min-w-[100px]">MRP</TableHead>
                          <TableHead className="min-w-[100px]">Stock *</TableHead>
                          <TableHead className="min-w-[120px]">SKU</TableHead>
                          <TableHead className="min-w-[200px]">Images</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {variants.map((variant, variantIndex) => (
                          <TableRow key={variantIndex} className={selectedVariants.has(variantIndex) ? "bg-blue-50" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedVariants.has(variantIndex)}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(selectedVariants);
                                  if (checked) {
                                    newSelected.add(variantIndex);
                                  } else {
                                    newSelected.delete(variantIndex);
                                  }
                                  setSelectedVariants(newSelected);
                                }}
                              />
                            </TableCell>
                            {variantOptions.map((option) => (
                              <TableCell key={option.name} className="font-medium">
                                {variant.options[option.name] || "-"}
                              </TableCell>
                            ))}
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={variant.price || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[variantIndex].price = parseFloat(e.target.value) || 0;
                                  setVariants(newVariants);
                                }}
                                className="h-8 w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={variant.mrp || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[variantIndex].mrp = parseFloat(e.target.value) || 0;
                                  setVariants(newVariants);
                                }}
                                className="h-8 w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variant.stock || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[variantIndex].stock = parseInt(e.target.value) || 0;
                                  setVariants(newVariants);
                                }}
                                className="h-8 w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Input
                                  placeholder="SKU"
                                  value={variant.sku || ""}
                                  onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[variantIndex] = { ...newVariants[variantIndex], sku: e.target.value };
                                    setVariants(newVariants);
                                    // Clear error when user starts typing
                                    if (errors[`variants.${variantIndex}.sku`]) {
                                      const newErrors = { ...errors };
                                      delete newErrors[`variants.${variantIndex}.sku`];
                                      setErrors(newErrors);
                                    }
                                  }}
                                  className={`h-8 w-full text-xs ${errors[`variants.${variantIndex}.sku`] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                  data-field={`variants.${variantIndex}.sku`}
                                />
                                {errors[`variants.${variantIndex}.sku`] && (
                                  <p className="text-xs text-red-500">{errors[`variants.${variantIndex}.sku`]}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  {(variant.images || []).map((imgUrl, imgIndex) => {
                                    const variantFeaturedIndex = variant.featuredImageIndex || 0;
                                    return (
                                      <div key={imgIndex} className="relative group">
                                        <img
                                          src={imgUrl}
                                          alt={`Variant image ${imgIndex + 1}`}
                                          className={`w-12 h-12 object-cover rounded border-2 ${
                                            variantFeaturedIndex === imgIndex ? "border-blue-500" : "border-gray-200"
                                          }`}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeVariantImage(variantIndex, imgIndex)}
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setVariantFeaturedImage(variantIndex, imgIndex)}
                                          className={`absolute top-0 left-0 p-0.5 rounded-full transition-all ${
                                            variantFeaturedIndex === imgIndex
                                              ? "bg-blue-500 text-white opacity-100"
                                              : "bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100"
                                          }`}
                                          title="Set as featured image"
                                        >
                                          <Star className={`h-3 w-3 ${variantFeaturedIndex === imgIndex ? "fill-current" : ""}`} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                                <input
                                  type="file"
                                  id={`variant-image-upload-${variantIndex}`}
                                  accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                                  multiple
                                  onChange={(e) => handleVariantImageUpload(variantIndex, e)}
                                  className="hidden"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => document.getElementById(`variant-image-upload-${variantIndex}`).click()}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Add Images
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Track the removed variant's option combination
                                  const removedVariant = variants[variantIndex];
                                  if (removedVariant && removedVariant.options) {
                                    const key = JSON.stringify(removedVariant.options);
                                    manuallyRemovedVariantsRef.current.add(key);
                                  }
                                  
                                  // Remove variant immediately without confirmation
                                  const newVariants = variants.filter((_, i) => i !== variantIndex);
                                  setVariants(newVariants);
                                  
                                  // Check if any values in the removed variant are no longer used
                                  if (removedVariant && removedVariant.options) {
                                    const updatedOptions = [...variantOptions];
                                    let optionsChanged = false;
                                    
                                    // For each option in the removed variant
                                    Object.entries(removedVariant.options).forEach(([optionName, optionValue]) => {
                                      // Find the option index
                                      const optIndex = updatedOptions.findIndex(opt => opt.name === optionName);
                                      if (optIndex >= 0) {
                                        // Check if this value is still used by any remaining variant
                                        const isValueStillUsed = newVariants.some(variant => 
                                          variant.options && variant.options[optionName] === optionValue
                                        );
                                        
                                        // If value is not used by any remaining variant, remove it
                                        if (!isValueStillUsed) {
                                          updatedOptions[optIndex].values = updatedOptions[optIndex].values.filter(
                                            val => val !== optionValue
                                          );
                                          optionsChanged = true;
                                        }
                                      }
                                    });
                                    
                                    // Update variant options if any values were removed
                                    if (optionsChanged) {
                                      setVariantOptions(updatedOptions);
                                    }
                                  }
                                  
                                  // Update selected variants - adjust indices for remaining variants
                                  const newSelected = new Set();
                                  selectedVariants.forEach((idx) => {
                                    if (idx < variantIndex) {
                                      // Keep indices before removed variant
                                      newSelected.add(idx);
                                    } else if (idx > variantIndex) {
                                      // Adjust indices after removed variant
                                      newSelected.add(idx - 1);
                                    }
                                    // Skip the removed variant index
                                  });
                                  setSelectedVariants(newSelected);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Bulk Edit Bar */}
                  {selectedVariants.size > 0 && bulkEditField && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Label className="font-medium">
                          Bulk Edit {bulkEditField.charAt(0).toUpperCase() + bulkEditField.slice(1)} for {selectedVariants.size} variant{selectedVariants.size !== 1 ? 's' : ''}:
                        </Label>
                        <Input
                          type={bulkEditField === 'stock' ? 'number' : bulkEditField === 'price' || bulkEditField === 'mrp' ? 'number' : 'text'}
                          step={bulkEditField === 'price' || bulkEditField === 'mrp' ? '0.01' : undefined}
                          placeholder={`Enter ${bulkEditField}`}
                          className="w-48"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const value = bulkEditField === 'stock' 
                                ? parseInt(e.target.value) 
                                : bulkEditField === 'price' || bulkEditField === 'mrp'
                                ? parseFloat(e.target.value)
                                : e.target.value;
                              if (value !== null && value !== undefined && value !== '') {
                                const newVariants = [...variants];
                                selectedVariants.forEach((idx) => {
                                  newVariants[idx][bulkEditField] = value;
                                });
                                setVariants(newVariants);
                                toast.success(`Updated ${bulkEditField} for ${selectedVariants.size} variant${selectedVariants.size !== 1 ? 's' : ''}`);
                                e.target.value = "";
                                setBulkEditField(null);
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setBulkEditField(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {errors.variants && (
                    <p className="text-sm text-red-500 mt-4">{errors.variants}</p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {variantOptions.length > 0 && variantOptions.every(opt => opt.values.length > 0) && variants.length === 0 && (
              <Card className="border-yellow-200 bg-yellow-50/30">
                <CardContent className="pt-6">
                  <p className="text-sm text-yellow-800 text-center">
                    Add values to your options to automatically generate variants
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

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
                <Label htmlFor="slug" className={errors.slug ? "text-red-500" : ""}>
                  URL Slug (URL-friendly)
                </Label>
                <Input
                  id="slug"
                  placeholder="product-url-slug"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={errors.slug ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Auto-generated from name. Edit manually if needed. Maximum 200 characters ({formData.slug.length}/200)
                </p>
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
