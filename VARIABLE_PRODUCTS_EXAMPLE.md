# Variable Products - Example Data Structure

This document provides example data structures for variable products in the e-commerce system.

## Overview

Variable products allow a single product to have multiple variations with different:
- Prices
- Stock levels
- SKUs
- Images
- Attribute combinations (e.g., Color + Size, Material + Size)

## Example: T-Shirt with Color and Size Variations

### Product Structure

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Premium Cotton T-Shirt",
  "description": "High-quality cotton t-shirt available in multiple colors and sizes",
  "productType": "variable",
  "categories": ["507f1f77bcf86cd799439012"],
  "images": [
    "https://example.com/tshirt-main.jpg",
    "https://example.com/tshirt-back.jpg"
  ],
  "variantOptions": [
    {
      "name": "Color",
      "values": ["Red", "Blue", "Black", "White"]
    },
    {
      "name": "Size",
      "values": ["S", "M", "L", "XL"]
    }
  ],
  "variants": [
    {
      "options": {
        "Color": "Red",
        "Size": "S"
      },
      "price": 29.99,
      "mrp": 39.99,
      "stock": 50,
      "sku": "TSHIRT-RED-S",
      "image": "https://example.com/tshirt-red.jpg",
      "isActive": true
    },
    {
      "options": {
        "Color": "Red",
        "Size": "M"
      },
      "price": 29.99,
      "mrp": 39.99,
      "stock": 75,
      "sku": "TSHIRT-RED-M",
      "image": "https://example.com/tshirt-red.jpg",
      "isActive": true
    },
    {
      "options": {
        "Color": "Red",
        "Size": "L"
      },
      "price": 29.99,
      "mrp": 39.99,
      "stock": 30,
      "sku": "TSHIRT-RED-L",
      "image": "https://example.com/tshirt-red.jpg",
      "isActive": true
    },
    {
      "options": {
        "Color": "Blue",
        "Size": "S"
      },
      "price": 29.99,
      "mrp": 39.99,
      "stock": 45,
      "sku": "TSHIRT-BLUE-S",
      "image": "https://example.com/tshirt-blue.jpg",
      "isActive": true
    },
    {
      "options": {
        "Color": "Blue",
        "Size": "M"
      },
      "price": 29.99,
      "mrp": 39.99,
      "stock": 60,
      "sku": "TSHIRT-BLUE-M",
      "image": "https://example.com/tshirt-blue.jpg",
      "isActive": true
    },
    {
      "options": {
        "Color": "Black",
        "Size": "L"
      },
      "price": 34.99,
      "mrp": 44.99,
      "stock": 25,
      "sku": "TSHIRT-BLACK-L",
      "image": "https://example.com/tshirt-black.jpg",
      "isActive": true
    },
    {
      "options": {
        "Color": "White",
        "Size": "XL"
      },
      "price": 29.99,
      "mrp": 39.99,
      "stock": 0,
      "sku": "TSHIRT-WHITE-XL",
      "image": "https://example.com/tshirt-white.jpg",
      "isActive": false
    }
  ],
  "isActive": true,
  "isFeatured": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Example: Laptop with Multiple Attributes

### Product Structure

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Gaming Laptop Pro",
  "description": "High-performance gaming laptop with customizable configurations",
  "productType": "variable",
  "categories": ["507f1f77bcf86cd799439014"],
  "images": [
    "https://example.com/laptop-main.jpg"
  ],
  "variantOptions": [
    {
      "name": "RAM",
      "values": ["8GB", "16GB", "32GB"]
    },
    {
      "name": "Storage",
      "values": ["256GB SSD", "512GB SSD", "1TB SSD"]
    },
    {
      "name": "Graphics",
      "values": ["RTX 3060", "RTX 3070", "RTX 3080"]
    }
  ],
  "variants": [
    {
      "options": {
        "RAM": "8GB",
        "Storage": "256GB SSD",
        "Graphics": "RTX 3060"
      },
      "price": 999.99,
      "mrp": 1299.99,
      "stock": 10,
      "sku": "LAPTOP-8GB-256-RTX3060",
      "image": "",
      "isActive": true
    },
    {
      "options": {
        "RAM": "16GB",
        "Storage": "512GB SSD",
        "Graphics": "RTX 3070"
      },
      "price": 1499.99,
      "mrp": 1899.99,
      "stock": 5,
      "sku": "LAPTOP-16GB-512-RTX3070",
      "image": "",
      "isActive": true
    },
    {
      "options": {
        "RAM": "32GB",
        "Storage": "1TB SSD",
        "Graphics": "RTX 3080"
      },
      "price": 1999.99,
      "mrp": 2499.99,
      "stock": 3,
      "sku": "LAPTOP-32GB-1TB-RTX3080",
      "image": "",
      "isActive": true
    }
  ],
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Key Points

1. **productType**: Must be set to `"variable"` for variable products
2. **variantOptions**: Defines the attributes (e.g., Color, Size) and their possible values
3. **variants**: Contains all possible combinations of attribute values, each with:
   - `options`: Object mapping attribute names to selected values
   - `price`: Variant-specific price (required)
   - `mrp`: Variant-specific MRP (optional)
   - `stock`: Variant-specific stock level (required)
   - `sku`: Variant-specific SKU (optional but recommended)
   - `image`: Variant-specific image URL (optional)
   - `isActive`: Whether this variant is active/available

4. **Base Product Fields**: For variable products:
   - `price` and `stock` at the product level are optional
   - `sku` at the product level is optional
   - All pricing and inventory is managed at the variant level

## Frontend Behavior

When a user selects a variation:
- The displayed price updates to the variant's price
- The stock status updates to the variant's stock
- The product image updates if the variant has a specific image
- The "Add to Cart" button includes the selected variant information

## API Usage

### Creating a Variable Product

```javascript
POST /api/products
{
  "name": "Premium Cotton T-Shirt",
  "description": "High-quality cotton t-shirt",
  "productType": "variable",
  "categories": ["category-id"],
  "images": ["https://example.com/image.jpg"],
  "variantOptions": [
    {
      "name": "Color",
      "values": ["Red", "Blue"]
    },
    {
      "name": "Size",
      "values": ["S", "M", "L"]
    }
  ],
  "variants": [
    {
      "options": { "Color": "Red", "Size": "S" },
      "price": 29.99,
      "mrp": 39.99,
      "stock": 50,
      "sku": "TSHIRT-RED-S"
    }
    // ... more variants
  ]
}
```

### Simple Product (for comparison)

```json
{
  "name": "Simple Product",
  "productType": "simple",
  "price": 29.99,
  "mrp": 39.99,
  "stock": 100,
  "sku": "SIMPLE-001"
}
```

