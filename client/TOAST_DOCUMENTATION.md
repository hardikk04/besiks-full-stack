# Toast Messaging System Documentation

This project uses **Sonner** as the toast notification library, with comprehensive toast messages implemented throughout the application to provide users with clear feedback for all actions.

## Features

✅ **Complete Toast Integration**

- All CRUD operations (Create, Read, Update, Delete)
- Form validation and submissions
- File uploads and management
- Authentication flows
- Search and filtering
- Data export (PDF/Excel)
- Loading states and error handling

✅ **Rich Toast Configuration**

- Position: Top-right
- Rich colors for better visual feedback
- Close button for user control
- 4-second duration (configurable)
- Loading, success, error, info, and warning types

## Toast Locations

### Admin Dashboard Components

#### 1. **Products Management** (`/admin/products`)

- ✅ Product creation with image upload validation
- ✅ Product deletion with confirmation
- ✅ Bulk operations (delete/status toggle)
- ✅ Status updates (active/inactive)
- ✅ Search functionality feedback
- ✅ Form validation errors
- ✅ Loading states for API calls

#### 2. **Categories Management** (`/admin/categories`)

- ✅ Category creation with image upload
- ✅ Category deletion and bulk operations
- ✅ Status updates
- ✅ Search and filter feedback
- ✅ Form validation
- ✅ File upload validation (size, type)

#### 3. **Customers Management** (`/admin/customers`)

- ✅ Customer deletion with confirmation
- ✅ Search functionality
- ✅ Loading states and error handling
- ✅ Empty state messaging

#### 4. **Orders Management** (`/admin/orders`)

- ✅ Search and filtering
- ✅ Export operations (PDF/Excel)
- ✅ Loading states for exports
- ✅ Order status updates

#### 5. **Discount/Coupons Management** (`/admin/discount`)

- ✅ Coupon creation and validation
- ✅ Coupon deletion and status changes
- ✅ Bulk operations
- ✅ Form validation
- ✅ Date validation for validity periods

### Authentication (`/auth`)

- ✅ Login form with validation
- ✅ Password reset functionality
- ✅ Authentication errors
- ✅ Session management

## Usage Examples

### Basic Toast Usage

```javascript
import { toast } from "sonner";

// Success message
toast.success("Operation completed successfully!");

// Error message
toast.error("Something went wrong!");

// Loading message
const loadingToast = toast.loading("Processing...");
// Later dismiss it
toast.dismiss(loadingToast);

// Info message
toast.info("Here's some information");

// Warning message
toast.warning("Please be careful!");
```

### Using Toast Utility Helper

```javascript
import ToastUtils from "@/lib/toast-utils";

// Pre-configured application toasts
ToastUtils.app.crud.createSuccess("Product");
ToastUtils.app.crud.deleteError("Customer");
ToastUtils.app.file.uploadSuccess(3);
ToastUtils.app.auth.loginSuccess("John Doe");

// API error handling
try {
  await apiCall();
} catch (error) {
  ToastUtils.handleApiError(error, "Failed to perform operation");
}

// Async operations with feedback
const result = await ToastUtils.withToastFeedback(() => createProduct(data), {
  loadingMessage: "Creating product...",
  successMessage: "Product created successfully!",
  errorMessage: "Failed to create product",
});
```

### Form Validation with Toasts

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    ToastUtils.app.form.validationError();
    return;
  }

  try {
    ToastUtils.loading("Creating product...");
    await createProduct(formData);
    ToastUtils.dismiss();
    ToastUtils.success("Product created successfully!");
    router.push("/admin/products");
  } catch (error) {
    ToastUtils.dismiss();
    ToastUtils.handleApiError(error);
  }
};
```

### File Upload with Toasts

```javascript
const handleFileUpload = (files) => {
  // Validation
  if (files.length > 5) {
    ToastUtils.app.file.typeError();
    return;
  }

  const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    ToastUtils.app.file.sizeError();
    return;
  }

  // Upload process
  ToastUtils.loading("Uploading files...");

  Promise.all(uploadPromises)
    .then(() => {
      ToastUtils.dismiss();
      ToastUtils.app.file.uploadSuccess(files.length);
    })
    .catch((error) => {
      ToastUtils.dismiss();
      ToastUtils.app.file.uploadError();
    });
};
```

## Toast Configuration

The toast system is configured in `app/layout.js`:

```javascript
<Toaster position="top-right" richColors closeButton duration={4000} />
```

### Available Options:

- **position**: `top-left`, `top-right`, `bottom-left`, `bottom-right`, `top-center`, `bottom-center`
- **richColors**: Enables colored toast backgrounds
- **closeButton**: Shows close button on toasts
- **duration**: Default display time in milliseconds
- **theme**: `light`, `dark`, or `system`

## Best Practices

### 1. **Meaningful Messages**

```javascript
// ❌ Generic
toast.success("Success!");

// ✅ Specific
toast.success("Product 'iPhone 15' created successfully!");
```

### 2. **Proper Error Handling**

```javascript
try {
  await apiCall();
  toast.success("Data saved successfully!");
} catch (error) {
  // Handle different error types
  if (error.status === 400) {
    toast.error("Invalid data provided");
  } else if (error.status === 401) {
    toast.error("You are not authorized for this action");
  } else {
    toast.error("An unexpected error occurred");
  }
}
```

### 3. **Loading States**

```javascript
const handleAsyncOperation = async () => {
  const loadingToast = toast.loading("Processing request...");

  try {
    await longRunningOperation();
    toast.dismiss(loadingToast);
    toast.success("Operation completed!");
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error("Operation failed");
  }
};
```

### 4. **User Confirmations**

```javascript
const handleDelete = (item) => {
  if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
    deleteItem(item.id)
      .then(() => toast.success(`"${item.name}" deleted successfully`))
      .catch(() => toast.error("Failed to delete item"));
  }
};
```

## Toast Types and When to Use

| Type      | Use Case               | Example                              |
| --------- | ---------------------- | ------------------------------------ |
| `success` | Successful operations  | "Product created", "Data saved"      |
| `error`   | Errors and failures    | "Validation failed", "Network error" |
| `loading` | Async operations       | "Uploading file", "Saving data"      |
| `info`    | Informational messages | "Search results", "Tips"             |
| `warning` | Warnings and cautions  | "Unsaved changes", "Limits reached"  |

## Accessibility Features

- **Keyboard Navigation**: Users can focus and dismiss toasts with keyboard
- **Screen Reader Support**: Toast messages are announced by screen readers
- **High Contrast**: Rich colors mode provides better visibility
- **Reduced Motion**: Respects user's motion preferences

## Troubleshooting

### Common Issues:

1. **Toast not appearing**

   - Check if `<Toaster />` is included in layout
   - Verify import path: `import { toast } from "sonner"`

2. **Multiple toasts stacking**

   - Use `toast.dismiss()` before showing new toast
   - Consider using `toast.promise()` for sequential operations

3. **Toast disappearing too quickly**
   - Adjust duration: `toast.success("Message", { duration: 6000 })`
   - Use `duration: Infinity` for persistent messages

## Future Enhancements

- [ ] Toast notifications for real-time updates (WebSocket)
- [ ] Custom toast components for complex content
- [ ] Toast history/log for debugging
- [ ] A/B testing for optimal toast timing and positioning
- [ ] Integration with analytics for user engagement tracking

---

For more information about Sonner, visit: [https://sonner.emilkowal.ski/](https://sonner.emilkowal.ski/)
