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
import { Plus, X, Upload, ImageIcon, ArrowLeft, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/features/products/productApi";
import { useGetAllCategoriesQuery } from "@/features/category/categoryApi";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/hooks/uploadImage";
import { getColorNameFromHex, isValidHex } from "@/lib/colorUtils";
import slugify from "slugify";

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
    tax: "0", // Initialize with "0" instead of empty string
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
  
  // Helper function to scroll to and highlight error field
  const scrollToErrorField = (fieldName, errorMessage = null) => {
    setTimeout(() => {
      let errorElement = document.getElementById(fieldName);
      
      if (!errorElement) {
        errorElement = document.querySelector(`[data-field="${fieldName}"]`);
      }
      
      // Handle special cases for categories and images
      if (!errorElement && fieldName === 'categories') {
        errorElement = document.querySelector(`[data-field="categories"]`);
      } else if (!errorElement && fieldName === 'images') {
        errorElement = document.querySelector(`[data-field="images"]`);
      } else if (!errorElement && fieldName === 'variantOptions') {
        errorElement = document.querySelector(`[data-field="variantOptions"]`);
      } else if (!errorElement && fieldName === 'variants') {
        errorElement = document.querySelector(`[data-field="variants"]`);
      } else if (fieldName?.startsWith('variants.')) {
        // Handle variant-specific errors like variants.0.price
        const parts = fieldName.split('.');
        const variantIndex = parseInt(parts[1]);
        const variantField = parts[2];
        // Find the variant row and the specific input
        const variantRows = document.querySelectorAll('[data-variant-row]');
        if (variantRows[variantIndex]) {
          const input = variantRows[variantIndex].querySelector(`[data-variant-field="${variantField}"]`);
          if (input) errorElement = input;
        }
      }
      
      if (errorElement) {
        // Add error highlight class
        errorElement.classList.add('error-highlight');
        
        // Scroll to element
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus on input if it's an input element
        if (errorElement.tagName === 'INPUT' || errorElement.tagName === 'TEXTAREA' || errorElement.tagName === 'SELECT') {
          setTimeout(() => {
            errorElement.focus();
            errorElement.select?.();
          }, 400);
        } else if (errorElement.querySelector) {
          // Find input within the container
          const input = errorElement.querySelector('input, textarea, select');
          if (input) {
            setTimeout(() => {
              input.focus();
              input.select?.();
            }, 400);
          }
        }
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          errorElement.classList.remove('error-highlight');
        }, 3000);
      }
    }, 100);
  };
  const [productType, setProductType] = useState("simple"); // "simple" or "variable"
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState([]);
  const [colorName, setColorName] = useState("");
  const [colorValue, setColorValue] = useState("#000000");
  const [colorHexInput, setColorHexInput] = useState("");
  const [autoFillName, setAutoFillName] = useState(true); // Auto-fill color name from hex
  
  // Variable product state
  const [variantOptions, setVariantOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState(new Set());
  const [bulkEditField, setBulkEditField] = useState(null);
  const manuallyRemovedVariantsRef = useRef(new Set()); // Track manually removed variant option combinations

  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();

  useEffect(() => {
    if (productResponse?.product) {
      const p = productResponse.product;
      
      // Ensure tax value matches SelectItem values: "0", "5", "12", "18", "28"
      let taxValue = "0"; // default
      if (p.tax !== null && p.tax !== undefined && p.tax !== "") {
        // Convert to string and trim whitespace
        const taxStr = String(p.tax).trim();
        // Check if it matches one of the valid SelectItem values
        const validTaxValues = ["0", "5", "12", "18", "28"];
        if (validTaxValues.includes(taxStr)) {
          taxValue = taxStr;
        } else {
          // Log for debugging if value doesn't match
          console.log("Tax value from product:", p.tax, "Normalized:", taxStr);
        }
      }

      setFormData({
        name: p.name || "",
        description: p.description || "",
        price: p.price?.toString?.() || "",
        mrp: p.mrp?.toString?.() || "",
        tax: taxValue,
        stock: p.stock?.toString?.() || "",
        sku: p.sku || "",
        slug: p.slug || "",
        metaTitle: p.metaTitle || "",
        metaDescription: p.metaDescription || "",
      });
      
      // Set product type and variable product data
      const productTypeValue = p.productType || "simple";
      setProductType(productTypeValue);
      // Only load variant options/variants for variable products
      if (productTypeValue === "variable") {
        setVariantOptions(p.variantOptions || []);
        // Handle backward compatibility: convert old 'image' to 'images' array
        const normalizedVariants = (p.variants || []).map(variant => {
          let variantImages = variant.images || [];
          if (variant.image && !variant.images) {
            variantImages = [variant.image];
          }
          if (!Array.isArray(variantImages)) {
            variantImages = variantImages ? [variantImages] : [];
          }
          return {
            ...variant,
            images: variantImages,
            featuredImageIndex: variant.featuredImageIndex !== undefined ? variant.featuredImageIndex : 0
          };
        });
        setVariants(normalizedVariants);
      } else {
        setVariantOptions([]);
        setVariants([]);
      }
      
      // Debug: Log product type to verify it's being set
      console.log("Product type from server:", p.productType, "Setting to:", productTypeValue);
      // Extract category IDs - handle both populated objects and plain IDs
      const categoryIds = (p.categories || []).map((c) => {
        // If it's an object with _id, use _id
        if (c && typeof c === 'object' && c._id) {
          return String(c._id);
        }
        // If it's already an ID (string or ObjectId), convert to string
        return String(c);
      }).filter(Boolean);
      
      // Debug: Log categories to verify they're being loaded
      console.log("Product categories:", p.categories);
      console.log("Extracted category IDs:", categoryIds);
      
      setSelectedCategories(categoryIds);
      // Tags are populated with names from the server
      setTags((p.tags || []).map((tag) => tag?.name || tag).filter(Boolean));
      setImages((p.images || []).map((url) => ({ url })));
      setFeaturedImageIndex(p.featuredImageIndex !== undefined ? p.featuredImageIndex : 0);
      setIsActive(Boolean(p.isActive));
      setSizes(p.sizes || []);
      setColors(p.colors || []);
      setIsSlugManuallyEdited(false); // Reset on load
      
      // Debug: Log tax value to verify it's being set correctly
      console.log("Product tax value:", p.tax, "Normalized to:", taxValue);
    }
  }, [productResponse]);
  
  // Debug: Log formData.tax whenever it changes
  useEffect(() => {
    console.log("FormData tax value:", formData.tax);
  }, [formData.tax]);

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

  // Generate all possible variant combinations from variantOptions (Shopify-style)
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
  
  // Track if product has been loaded to prevent overwriting existing variants on initial load
  const [productLoaded, setProductLoaded] = useState(false);
  const [initialVariantOptionsKey, setInitialVariantOptionsKey] = useState(null);
  
  useEffect(() => {
    if (productResponse?.product) {
      setProductLoaded(true);
      // Store the initial variant options key to detect changes
      if (productResponse.product.variantOptions) {
        const key = productResponse.product.variantOptions.map(o => `${o.name}:${o.values.join(',')}`).join('|');
        setInitialVariantOptionsKey(key);
      }
    }
  }, [productResponse]);
  
  useEffect(() => {
    // Only auto-generate if product has been loaded and options have actually changed from initial
    if (productLoaded && productType === "variable" && variantOptions.length > 0) {
      const currentKey = variantOptions.map(o => `${o.name}:${o.values.join(',')}`).join('|');
      // Only regenerate if options have changed from initial load
      if (initialVariantOptionsKey !== null && currentKey !== initialVariantOptionsKey) {
        const hasAllValues = variantOptions.every(opt => opt.values.length > 0);
        if (hasAllValues) {
          generateVariants(variantOptions, variants);
        } else {
          setVariants([]);
        }
      }
    } else if (productLoaded && productType === "variable" && variantOptions.length === 0) {
      setVariants([]);
    }
  }, [variantOptionsKey, productType, productLoaded, initialVariantOptionsKey]);

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
    // Normalize categoryId to string for consistent comparison
    const normalizedId = String(categoryId);
    setSelectedCategories((prev) => {
      // Normalize all IDs to strings for comparison
      const normalizedPrev = prev.map(id => String(id));
      if (normalizedPrev.includes(normalizedId)) {
        return prev.filter((id) => String(id) !== normalizedId);
      } else {
        return [...prev, normalizedId];
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

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error("Please upload only JPEG, PNG, WebP, or AVIF images");
      return;
    }

    toast.loading("Uploading images...");

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
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.dismiss();
      toast.error("Failed to upload images. Please try again.");
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    
    // Adjust featured image index if needed
    if (featuredImageIndex === idx) {
      setFeaturedImageIndex(0);
    } else if (featuredImageIndex > idx) {
      setFeaturedImageIndex(featuredImageIndex - 1);
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
          ? 0
          : currentFeaturedIndex > imageIndex
          ? currentFeaturedIndex - 1
          : currentFeaturedIndex
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
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (selectedCategories.length === 0) newErrors.categories = "At least one category is required";
    
    // Slug validation - optional since it will be auto-generated
    if (formData.slug) {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugPattern.test(formData.slug)) {
        newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
      } else if (formData.slug.length > 200) {
        newErrors.slug = "Slug cannot be more than 200 characters";
      }
    }

    // Validation based on product type
    if (productType === "simple") {
      if (!formData.price && formData.price !== 0) newErrors.price = "Sale price is required";
      if (!formData.mrp && formData.mrp !== 0) newErrors.mrp = "MRP is required";
      if (!formData.stock && formData.stock !== 0) newErrors.stock = "Stock is required";
      if (!formData.sku.trim()) newErrors.sku = "SKU is required";
      
      // Price validation
      if (formData.price && formData.mrp) {
        if (parseFloat(formData.price) > parseFloat(formData.mrp)) {
          newErrors.price = "Sale price cannot be higher than MRP";
        }
      }
    } else if (productType === "variable") {
      // For variable products, base SKU is optional (SKUs are managed at variant level)
      // No need to validate base SKU for variable products
      
      if (variantOptions.length === 0) {
        newErrors.variantOptions = "At least one variant attribute is required";
      }
      if (variants.length === 0) {
        newErrors.variants = "At least one variant is required";
      } else {
        // Validate each variant has required fields
        variants.forEach((variant, index) => {
          if (!variant.price && variant.price !== 0) {
            newErrors[`variants.${index}.price`] = "Variant price is required";
          }
          if (!variant.stock && variant.stock !== 0) {
            newErrors[`variants.${index}.stock`] = "Variant stock is required";
          }
          if (variant.mrp && variant.price && variant.price > variant.mrp) {
            newErrors[`variants.${index}.price`] = "Variant sale price cannot be higher than MRP";
          }
        });
        
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
    
    // Check for duplicate SKU between simple product SKU and other simple products (for simple products)
    // Note: This is a client-side check within the form. Server will do final validation against database.

    // Image validation
    if (images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    setErrors(newErrors);
    
    // Scroll to first error field if validation fails
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstErrorField = Object.keys(newErrors)[0];
        let errorElement = document.getElementById(firstErrorField);
        
        if (!errorElement) {
          errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
        }
        
        if (!errorElement && firstErrorField === 'categories') {
          const container = document.querySelector(`[data-field="categories"]`);
          if (container) errorElement = container;
        } else if (!errorElement && firstErrorField === 'images') {
          const container = document.querySelector(`[data-field="images"]`);
          if (container) errorElement = container;
        } else if (!errorElement && firstErrorField.startsWith('variants.')) {
          // Handle variant field errors
          errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
        }
        
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
    }
    
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      // Don't show toast - the highlighted fields are enough feedback
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      categories: selectedCategories,
      tags: tags,
      productType: productType,
      tax: formData.tax || "0",
      isActive: isActive,
      images: images.map((img) => img.url),
      featuredImageIndex: featuredImageIndex,
      slug: formData.slug,
      metaTitle: formData.metaTitle || "",
      metaDescription: formData.metaDescription || "",
      updatedAt: new Date().toISOString(),
    };

    // Add fields based on product type
    if (productType === "simple") {
      productData.price = parseFloat(formData.price) || 0;
      productData.mrp = parseFloat(formData.mrp) || 0;
      productData.stock = parseInt(formData.stock) || 0;
      productData.sku = formData.sku;
      // Don't send sizes and colors for simple products
    } else if (productType === "variable") {
      productData.variantOptions = variantOptions;
      productData.variants = variants;
    }

    try {
      toast.loading("Updating product...");
      await updateProduct({ id: productId, productInput: productData }).unwrap();
      toast.dismiss();
      toast.success("✅ Product Updated Successfully");
      router.push("/admin/products");
    } catch (err) {
      console.error("❌ Product update failed:", err);
      toast.dismiss();
      
      // Handle SKU uniqueness errors
      const errorMessage = err?.data?.message || "";
      if (errorMessage.includes("SKU") && (errorMessage.includes("UNIQUE") || errorMessage.includes("unique") || errorMessage.includes("already exist"))) {
        const serverErrors = {};
        
        // Check if it's a variant SKU error
        if (errorMessage.includes("variant") || err?.data?.errors?.variants) {
          // For variant SKU errors, we need to find which variant has the duplicate
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
        const serverErrors = {};
        const fieldErrors = err.data.errors;
        
        Object.keys(fieldErrors).forEach((key) => {
          if (fieldErrors[key] && fieldErrors[key].length > 0) {
            serverErrors[key] = Array.isArray(fieldErrors[key]) 
              ? fieldErrors[key][0] 
              : fieldErrors[key];
          }
        });
        
        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
          
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
            checked={selectedCategories.includes(String(category._id))}
            onCheckedChange={() => handleCategoryToggle(String(category._id))}
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
                <Label htmlFor="productType">Product Type *</Label>
                <Select
                  key={`product-type-${productType}`}
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
                  Simple: Single product with fixed price and stock. Variable: Product with multiple variations.
                </p>
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

              {productType === "simple" && (
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
              )}
              {productType === "variable" && (
                <p className="text-sm text-muted-foreground">
                  Pricing is managed at the variant level for variable products.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax Rate (%)</Label>
                  <Select
                    key={`tax-${formData.tax || "0"}`}
                    value={formData.tax || "0"}
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
                {productType === "simple" && (
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      data-field="sku"
                      placeholder="Unique SKU"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      required
                      className={errors.sku ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {errors.sku && (
                      <p className="text-sm text-red-500">{errors.sku}</p>
                    )}
                  </div>
                )}
                {productType === "variable" && (
                  <div className="space-y-2">
                    <Label htmlFor="sku">Base SKU (Optional)</Label>
                    <Input
                      id="sku"
                      data-field="sku"
                      placeholder="Base SKU (optional for variable products)"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      className={errors.sku ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {errors.sku && (
                      <p className="text-sm text-red-500">{errors.sku}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      SKU is managed at variant level for variable products
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL-friendly)</Label>
                  <Input
                    id="slug"
                    placeholder="seo-friendly-slug"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from name. Edit manually if needed. Maximum 200 characters ({formData.slug.length}/200)
                  </p>
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
                    // Normalize IDs to strings for comparison
                    const normalizedId = String(categoryId);
                    const category = categoriesData?.categories?.find((cat) => String(cat._id) === normalizedId);
                    const parentCategory = category?.parent
                      ? categoriesData?.categories?.find((cat) => String(cat._id) === String(category.parent))
                      : null;
                    return (
                      <Badge key={categoryId} variant="secondary" className="text-xs">
                        {parentCategory ? (
                          <span className="text-muted-foreground">{parentCategory.name} → {category?.name}</span>
                        ) : (
                          category?.name || categoryId
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
                <Input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" multiple onChange={handleImageUpload} className="hidden" />
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
                <div key={idx} className="relative border-2 rounded-md overflow-hidden group" style={{ borderColor: featuredImageIndex === idx ? '#3b82f6' : undefined }}>
                  <img src={img.preview || img.url} alt="product" className="aspect-square object-cover w-full" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeaturedImageIndex(idx)}
                    className={`absolute top-1 left-1 p-1 rounded-full transition-all ${
                      featuredImageIndex === idx
                        ? "bg-blue-500 text-white opacity-100"
                        : "bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100"
                    }`}
                    title="Set as featured image"
                  >
                    <Star className={`h-4 w-4 ${featuredImageIndex === idx ? "fill-current" : ""}`} />
                  </button>
                  {featuredImageIndex === idx && (
                    <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
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
                            const newOptions = variantOptions
                              .filter((_, i) => i !== optionIndex)
                              .map(opt => ({ ...opt, values: [...opt.values] }));
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
                                const newOptions = variantOptions.map((opt, idx) => 
                                  idx === optionIndex 
                                    ? { ...opt, values: [...opt.values].filter((_, i) => i !== valueIndex) }
                                    : { ...opt, values: [...opt.values] }
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
                                const newOptions = variantOptions.map((opt, idx) => 
                                  idx === optionIndex 
                                    ? { ...opt, values: [...opt.values, value] }
                                    : { ...opt, values: [...opt.values] }
                                );
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
                              const newOptions = variantOptions.map((opt, idx) => 
                                idx === optionIndex 
                                  ? { ...opt, values: [...opt.values, value] }
                                  : { ...opt, values: [...opt.values] }
                              );
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
                      id="new-attribute-input-edit"
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
                        const input = document.getElementById('new-attribute-input-edit');
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
                                  newVariants[variantIndex] = { ...newVariants[variantIndex], price: parseFloat(e.target.value) || 0 };
                                  setVariants(newVariants);
                                }}
                                className="h-8 text-sm"
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
                                  newVariants[variantIndex] = { ...newVariants[variantIndex], mrp: parseFloat(e.target.value) || 0 };
                                  setVariants(newVariants);
                                }}
                                className="h-8 text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variant.stock || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[variantIndex] = { ...newVariants[variantIndex], stock: parseInt(e.target.value) || 0 };
                                  setVariants(newVariants);
                                }}
                                className="h-8 text-sm"
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
                                  className={`h-8 text-sm ${errors[`variants.${variantIndex}.sku`] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                                  id={`variant-image-upload-edit-${variantIndex}`}
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
                                  onClick={() => document.getElementById(`variant-image-upload-edit-${variantIndex}`).click()}
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
                                  
                                  // Remove variant immediately
                                  const newVariants = variants.filter((_, i) => i !== variantIndex);
                                  setVariants(newVariants);
                                  
                                  // Check if any values in the removed variant are no longer used
                                  if (removedVariant && removedVariant.options) {
                                    let updatedOptions = variantOptions.map(opt => ({ ...opt, values: [...opt.values] }));
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
                                          updatedOptions[optIndex] = {
                                            ...updatedOptions[optIndex],
                                            values: [...updatedOptions[optIndex].values].filter(
                                              val => val !== optionValue
                                            )
                                          };
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
                  {selectedVariants.size > 0 && bulkEditField && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step={bulkEditField === 'price' || bulkEditField === 'mrp' ? "0.01" : "1"}
                          placeholder={`Enter ${bulkEditField}`}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const value = bulkEditField === 'price' || bulkEditField === 'mrp' 
                                ? parseFloat(e.target.value) || 0
                                : parseInt(e.target.value) || 0;
                              const newVariants = [...variants];
                              selectedVariants.forEach((index) => {
                                newVariants[index][bulkEditField] = value;
                              });
                              setVariants(newVariants);
                              e.target.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            const input = e.target.closest('.flex').querySelector('input');
                            const value = bulkEditField === 'price' || bulkEditField === 'mrp' 
                              ? parseFloat(input?.value) || 0
                              : parseInt(input?.value) || 0;
                            const newVariants = [...variants];
                            selectedVariants.forEach((index) => {
                              newVariants[index][bulkEditField] = value;
                            });
                            setVariants(newVariants);
                            if (input) input.value = "";
                          }}
                        >
                          Apply
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
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
          </>
        )}

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" disabled={isUpdatingProduct}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
