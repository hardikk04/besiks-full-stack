import { toast } from "sonner";

// Success messages
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    duration: 4000,
    ...options,
  });
};

// Error messages
export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    duration: 5000,
    ...options,
  });
};

// Loading messages
export const showLoadingToast = (message, options = {}) => {
  return toast.loading(message, {
    duration: Infinity,
    ...options,
  });
};

// Info messages
export const showInfoToast = (message, options = {}) => {
  toast.info(message, {
    duration: 4000,
    ...options,
  });
};

// Warning messages
export const showWarningToast = (message, options = {}) => {
  toast.warning(message, {
    duration: 4500,
    ...options,
  });
};

// Promise-based toast for async operations
export const showPromiseToast = (promise, messages, options = {}) => {
  return toast.promise(promise, {
    loading: messages.loading || "Processing...",
    success: messages.success || "Operation completed successfully",
    error: messages.error || "Operation failed",
    duration: 4000,
    ...options,
  });
};

// Dismiss specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Common application-specific toasts
export const AppToasts = {
  // Authentication
  auth: {
    loginSuccess: (username) => showSuccessToast(`Welcome back, ${username}!`),
    loginError: () => showErrorToast("Invalid email or password"),
    logoutSuccess: () =>
      showSuccessToast("You have been logged out successfully"),
    sessionExpired: () =>
      showErrorToast("Your session has expired. Please login again"),
  },

  // CRUD operations
  crud: {
    createSuccess: (item) => showSuccessToast(`${item} created successfully`),
    createError: (item) => showErrorToast(`Failed to create ${item}`),
    updateSuccess: (item) => showSuccessToast(`${item} updated successfully`),
    updateError: (item) => showErrorToast(`Failed to update ${item}`),
    deleteSuccess: (item) => showSuccessToast(`${item} deleted successfully`),
    deleteError: (item) => showErrorToast(`Failed to delete ${item}`),
    bulkDeleteSuccess: (count, item) =>
      showSuccessToast(`${count} ${item}s deleted successfully`),
    bulkUpdateSuccess: (count, item) =>
      showSuccessToast(`${count} ${item}s updated successfully`),
  },

  // File operations
  file: {
    uploadSuccess: (count = 1) =>
      showSuccessToast(
        `${count > 1 ? `${count} files` : "File"} uploaded successfully`
      ),
    uploadError: () => showErrorToast("Failed to upload file(s)"),
    removeSuccess: () => showSuccessToast("File removed"),
    sizeError: () =>
      showErrorToast("File is too large. Please use a file under 5MB"),
    typeError: () =>
      showErrorToast(
        "Invalid file type. Please upload only allowed file formats"
      ),
  },

  // Data operations
  data: {
    saveSuccess: () => showSuccessToast("Data saved successfully"),
    saveError: () => showErrorToast("Failed to save data"),
    loadError: () => showErrorToast("Failed to load data"),
    exportSuccess: (format) =>
      showSuccessToast(`${format} exported successfully`),
    exportError: (format) => showErrorToast(`Failed to export ${format}`),
    copySuccess: (item) => showSuccessToast(`${item} copied to clipboard`),
  },

  // Form validation
  form: {
    validationError: () =>
      showErrorToast("Please fix the form errors before submitting"),
    requiredFields: () => showErrorToast("Please fill in all required fields"),
    invalidEmail: () => showErrorToast("Please enter a valid email address"),
    passwordMismatch: () => showErrorToast("Passwords do not match"),
    weakPassword: () =>
      showErrorToast(
        "Password must be at least 8 characters with numbers and letters"
      ),
  },

  // Network operations
  network: {
    offline: () =>
      showErrorToast("You are offline. Please check your internet connection"),
    timeout: () => showErrorToast("Request timed out. Please try again"),
    serverError: () => showErrorToast("Server error. Please try again later"),
    connectionError: () =>
      showErrorToast("Connection error. Please check your network"),
  },

  // Search operations
  search: {
    noResults: (query) => showInfoToast(`No results found for "${query}"`),
    searching: () => showLoadingToast("Searching..."),
    resultsFound: (count) => showInfoToast(`Found ${count} result(s)`),
  },

  // Status changes
  status: {
    activated: (item) => showSuccessToast(`${item} activated successfully`),
    deactivated: (item) => showSuccessToast(`${item} deactivated successfully`),
    published: (item) => showSuccessToast(`${item} published successfully`),
    unpublished: (item) => showSuccessToast(`${item} unpublished successfully`),
  },
};

// Utility function for API error handling
export const handleApiError = (
  error,
  fallbackMessage = "An error occurred"
) => {
  console.error("API Error:", error);

  const message =
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    fallbackMessage;

  showErrorToast(message);
};

// Utility function for async operations with toast feedback
export const withToastFeedback = async (
  operation,
  {
    loadingMessage = "Processing...",
    successMessage = "Operation completed successfully",
    errorMessage = "Operation failed",
  } = {}
) => {
  const loadingToast = showLoadingToast(loadingMessage);

  try {
    const result = await operation();
    dismissToast(loadingToast);
    showSuccessToast(successMessage);
    return result;
  } catch (error) {
    dismissToast(loadingToast);
    handleApiError(error, errorMessage);
    throw error;
  }
};

export default {
  success: showSuccessToast,
  error: showErrorToast,
  loading: showLoadingToast,
  info: showInfoToast,
  warning: showWarningToast,
  promise: showPromiseToast,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
  app: AppToasts,
  handleApiError,
  withToastFeedback,
};
