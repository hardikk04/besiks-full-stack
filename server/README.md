# E-commerce Backend API

A simple Node.js/Express backend for an e-commerce application with Firebase authentication support.

## Features

- **Authentication**: JWT-based authentication (Firebase auth handled in frontend)
- **Products**: CRUD operations for products with tags
- **Categories**: Product categorization
- **Tags**: Product tagging system
- **Orders**: Order management with coupon support and Razorpay integration
- **Coupons**: Discount code system
- **Users**: User management

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Configure environment variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `PORT`: Server port (default: 5000)

4. Start the server:
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/phone
- `GET /api/auth/me` - Get current user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/:id` - Get single tag
- `POST /api/tags` - Create tag (Admin)
- `PUT /api/tags/:id` - Update tag (Admin)
- `DELETE /api/tags/:id` - Delete tag (Admin)

### Coupons
- `GET /api/coupons/active` - Get active coupons
- `POST /api/coupons/validate` - Validate coupon code
- `GET /api/coupons` - Get all coupons (Admin)
- `POST /api/coupons` - Create coupon (Admin)
- `PUT /api/coupons/:id` - Update coupon (Admin)
- `DELETE /api/coupons/:id` - Delete coupon (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/confirm-payment` - Confirm Razorpay payment
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/deliver` - Mark order as delivered (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

## Authentication Flow

1. User authenticates with Firebase in frontend (phone/OTP, Google, Facebook, Apple)
2. Frontend sends verified email/phone to `/api/auth/login`
3. Backend creates/finds user and returns JWT token
4. Frontend uses JWT token in Authorization header for protected routes

## Payment Flow (Razorpay)

1. **Create Order**: `POST /api/orders` - Creates order with pending payment status
2. **Frontend**: Integrates with Razorpay for payment
3. **Payment Success**: Frontend calls `PUT /api/orders/:id/confirm-payment` with:
   - `razorpayPaymentId`: Payment ID from Razorpay
   - `razorpaySignature`: Payment signature for verification
   - `paymentMethod`: Payment method used (optional)
4. **Backend**: Updates order with payment details and marks as paid

## Coupon System

- Supports percentage and fixed amount discounts
- Minimum order amount requirements
- Maximum discount limits
- User eligibility checks (first-time users, new users)
- Usage limits and tracking
- Category and product restrictions

## Database Models

- **User**: Basic user information
- **Product**: Product details with tag references
- **Tag**: Product categorization tags
- **Category**: Product categories
- **Order**: Order information with coupon support and Razorpay fields
- **Coupon**: Discount codes with validation rules

## Order Payment Fields

- `isPaid`: Boolean indicating payment status
- `paidAt`: Timestamp when payment was confirmed
- `razorpayOrderId`: Razorpay order ID
- `razorpayPaymentId`: Razorpay payment ID
- `razorpaySignature`: Payment signature for verification
- `paymentResult`: Detailed payment information
- `paymentMethod`: Payment method used 