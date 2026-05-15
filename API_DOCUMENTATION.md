# 📋 E-Commerce API Documentation

**Last Updated:** May 4, 2026  
**Base URL:** `http://localhost:3001/api/v1`

---

## 📑 Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Account/User APIs](#accountuser-apis)
3. [Category APIs](#category-apis)
4. [Product APIs](#product-apis)
5. [Order APIs](#order-apis)
6. [Cart APIs](#cart-apis)
7. [Seller APIs](#seller-apis)
8. [Shop APIs](#shop-apis)
9. [Admin APIs](#admin-apis)

---

## 🔐 Authentication APIs
**Base Path:** `/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/accounts` | ❌ | Register new user |
| POST | `/auth/verifications` | ❌ | Verify email/phone |
| POST | `/auth/sessions` | ❌ | Login (create session) |
| DELETE | `/auth/sessions` | ✅ | Logout |
| POST | `/auth/sessions/refresh` | ❌ | Refresh JWT token |
| GET | `/auth/google` | ❌ | Get Google OAuth URL |
| GET | `/auth/google/callback` | ❌ | Google OAuth callback |
| GET | `/auth/me` | ✅ | Get current user info |
| POST | `/auth/password-reset/request` | ❌ | Request password reset |
| POST | `/auth/password-reset/verify` | ❌ | Verify OTP for reset |
| POST | `/auth/password-reset/reset` | ❌ | Reset password |

---

## 👤 Account/User APIs
**Base Path:** `/accounts`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/accounts/me` | ✅ | Get user profile |
| PUT | `/accounts/me` | ✅ | Update user profile |
| PUT | `/accounts/password` | ✅ | Change password |

---

## 📂 Category APIs
**Base Path:** `/categories`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/categories` | ❌ | - | Get all categories |
| GET | `/categories/:id/products` | ❌ | - | Get products by category |
| POST | `/categories` | ✅ | Admin | Create category |
| PUT | `/categories/:id` | ✅ | Admin | Update category |
| DELETE | `/categories/:id` | ✅ | Admin | Delete category |

---

## 🛍️ Product APIs
**Base Path:** `/products`

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/customer/products` | Search & filter products |
| GET | `/products/customer/products/:id` | Get product details |

### Customer Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/products/customer/products/:id/reviews` | ✅ | Create product review |

### Seller Routes (Requires Seller/Admin role)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/products/seller/products` | ✅ | Seller/Admin | Get seller's products |
| POST | `/products/seller/products` | ✅ | Seller/Admin | Create new product |
| PUT | `/products/seller/products/:id` | ✅ | Seller/Admin | Update product |
| DELETE | `/products/seller/products/:id` | ✅ | Seller/Admin | Delete product |
| PATCH | `/products/seller/products/:id/stock` | ✅ | Seller/Admin | Update stock |
| GET | `/products/seller/statistics` | ✅ | Seller/Admin | Get revenue statistics |

### Admin Routes
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/products/admin/products` | ✅ | Admin | Get pending products for moderation |
| DELETE | `/products/admin/products/:id` | ✅ | Admin | Delete product for violation |

---

## 📦 Order APIs
**Base Path:** `/orders`

### Customer Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders/customer/orders` | ✅ | Get customer's orders list |
| GET | `/orders/customer/orders/:id` | ✅ | Get order details |
| POST | `/orders/customer/orders` | ✅ | Create new order (checkout) |
| PATCH | `/orders/customer/orders/:id` | ✅ | Cancel order |
| GET | `/orders/customer/orders/:id/payment_link` | ✅ | Get payment link |

### Seller Routes (Requires Seller/Admin role)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/orders/seller/orders` | ✅ | Seller/Admin | Get seller's orders |
| GET | `/orders/seller/orders/:id/status` | ✅ | Seller/Admin | Get order status |
| PATCH | `/orders/seller/orders/:id/status` | ✅ | Seller/Admin | Update order status |

### Admin Routes
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/orders/admin/orders` | ✅ | Admin | Get all orders |

---

## 🛒 Cart APIs
**Base Path:** `/customer/cart`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/customer/cart/` | ✅ | Get shopping cart |
| POST | `/customer/cart/:item_id` | ✅ | Add item to cart |
| PUT | `/customer/cart/:item_id` | ✅ | Update item quantity |
| DELETE | `/customer/cart/:item_id` | ✅ | Remove item from cart |
| DELETE | `/customer/cart/` | ✅ | Clear entire cart |

---

## 🏪 Seller APIs
**Base Path:** `/sellers`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/sellers/shops` | ✅ | Register shop |
| GET | `/sellers/shops/me` | ✅ | Get my shop info |
| PATCH | `/sellers/shops/me` | ✅ | Update shop info |
| PATCH | `/sellers/shops/me/status` | ✅ | Update shop status |
| PATCH | `/sellers/shops/address` | ✅ | Update shop address |

---

## 🏬 Shop APIs
**Base Path:** `/shops` (Public routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/shops/` | ❌ | Get all shops |
| GET | `/shops/:id` | ❌ | Get shop details by ID |

---

## 🔧 Admin APIs
**Base Path:** `/admin`

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/admin/shops` | ✅ | Admin | Get all shops (for moderation) |
| PATCH | `/admin/shops/:id/verify` | ✅ | Admin | Verify shop |
| PATCH | `/admin/shops/:id/control` | ✅ | Admin | Control shop (activate/deactivate) |

---

## 🔑 Authentication Headers

All protected endpoints (marked with ✅ Auth) require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📊 User Roles

| Role | Access |
|------|--------|
| `user` | Customer routes, cart, orders |
| `seller` | Product management, seller orders, shop management |
| `admin` | All admin routes, moderation, shop control |

Users have `roles` array, e.g.: `['user', 'seller']`

---

## ⚠️ Known Issues / Conflicts

### ✅ RESOLVED:
- ~~Duplicate categoryRoutes mount~~ → Fixed
- ~~Middleware role inconsistency (role vs roles)~~ → Standardized to `roles` array
- ~~Unclear endpoint paths~~ → Organized by resource and permission level

### 📝 Current State:
- All endpoints organized by resource and permission level
- Consistent middleware usage with roles array
- Clear separation: Public → Customer → Seller → Admin

---

## 🧪 Testing

Base endpoint test:
```bash
curl http://localhost:3000/
# Response: { "message": "E-Commerce API is running..." }
```

---
