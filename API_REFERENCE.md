# 📖 Nexora REST API Reference & Contract Specification

This document provides the complete API specification for the **Nexora E-Commerce Platform**. All endpoints, request schemas, parameters, responses, validation constraints, and cURL examples are documented here.

---

## 📑 Table of Contents

- [1. General Conventions & Protocol](#1-general-conventions--protocol)
  - [1.1 Base URL & Content Negotiation](#11-base-url--content-negotiation)
  - [1.2 Authentication & Session Cookies](#12-authentication--session-cookies)
  - [1.3 Standard Error Format](#13-standard-error-format)
  - [1.4 Pagination Envelope](#14-pagination-envelope)
- [2. Authentication & User Profile Endpoints](#2-authentication--user-profile-endpoints)
  - [POST /users/register](#post-usersregister)
  - [POST /users/login](#post-userslogin)
  - [POST /users/logout](#post-userslogout)
  - [GET /users/profile](#get-usersprofile)
  - [PUT /users/profile](#put-usersprofile)
- [3. Product Catalog Endpoints (Public)](#3-product-catalog-endpoints-public)
  - [GET /product](#get-product)
  - [GET /product/categories](#get-productcategories)
  - [GET /product/:id](#get-productid)
- [4. Product Administration Endpoints (Admin Only)](#4-product-administration-endpoints-admin-only)
  - [POST /product](#post-product)
  - [PUT /product/:id](#put-productid)
  - [DELETE /product/:id](#delete-productid)
  - [GET /product/admin/all](#get-productadminall)
  - [GET /product/admin/:id](#get-productadminid)
- [5. Shopping Cart Endpoints](#5-shopping-cart-endpoints)
  - [GET /cart](#get-cart)
  - [POST /cart](#post-cart)
  - [PUT /cart/:productId](#put-cartproductid)
  - [DELETE /cart/:productId](#delete-cartproductid)
- [6. Customer Order Endpoints](#6-customer-order-endpoints)
  - [POST /order](#post-order-cod)
  - [GET /order](#get-order)
  - [GET /order/:orderId](#get-orderorderid)
  - [PUT /order/cancel/:orderId](#put-ordercancelorderid)
- [7. Order Administration Endpoints (Admin Only)](#7-order-administration-endpoints-admin-only)
  - [GET /admin/order](#get-adminorder)
  - [PUT /admin/order/:orderId](#put-adminorderorderid)
- [8. Payment & Stripe Webhook Endpoints](#8-payment--stripe-webhook-endpoints)
  - [POST /payments/create-intent](#post-paymentscreate-intent)
  - [POST /payments/webhook](#post-paymentswebhook)
- [9. Wishlist Endpoints](#9-wishlist-endpoints)
  - [GET /wishlist](#get-wishlist)
  - [POST /wishlist/:productId](#post-wishlistproductid)
  - [DELETE /wishlist/:productId](#delete-wishlistproductid)

---

## 1. General Conventions & Protocol

### 1.1 Base URL & Content Negotiation
- **Development Base URL**: `http://localhost:3000`
- **Default Media Type**: `application/json` (All bodies must be JSON, except for `/payments/webhook` which accepts raw binary payload).
- **CORS Requirements**: Requests from web browsers must include credentials:
  ```javascript
  axios.create({ baseURL: "http://localhost:3000", withCredentials: true });
  ```

---

### 1.2 Authentication & Session Cookies
Authentication is handled via an **HTTP-Only Cookie** named `token`.
- Upon successful login via `POST /users/login`, the server returns a `Set-Cookie` header:
  ```http
  Set-Cookie: token=<jwt_token>; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
  ```
- Authenticated requests must automatically transmit this cookie. If missing or invalid, protected endpoints return `401 Unauthorized`.
- Endpoints requiring administrator status also inspect `req.user.role === 'admin'`. If the user is a standard customer, the API returns `403 Forbidden`.

---

### 1.3 Standard Error Format
When an API request fails, the response body contains a standardized JSON error message:

```json
{
  "message": "Human-readable description of error",
  "error": "Optional low-level system error detail"
}
```

#### HTTP Status Code Mapping:
- `200 OK` — Successful operation.
- `201 Created` — Resource successfully created.
- `400 Bad Request` — Missing or malformed input payload, invalid query parameters.
- `401 Unauthorized` — Authentication cookie is missing or has expired.
- `403 Forbidden` — Authenticated user lacks permission (`admin` role required).
- `404 Not Found` — Requested entity or route does not exist.
- `409 Conflict` — Duplicate entry (e.g., email already registered, concurrent checkout conflict).
- `500 Internal Server Error` — Unhandled server exception.

---

### 1.4 Pagination Envelope
List endpoints return a standardized pagination object:

```json
{
  "message": "Products fetched successfully",
  "products": [ ... ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 2. Authentication & User Profile Endpoints

### POST /users/register
Registers a new customer account in the MySQL database with a bcrypt-hashed password.

- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Validation Rules**:
  - `name`: Required, non-empty string.
  - `email`: Required, valid email format, must be unique across all users.
  - `password`: Required string.
- **Responses**:
  - `201 Created`:
    ```json
    { "message": "User registered successfully" }
    ```
  - `400 Bad Request`: `{ "message": "Name,email,password are required" }`
  - `409 Conflict`: `{ "message": "Email already registered" }`
- **cURL Example**:
  ```bash
  curl -X POST http://localhost:3000/users/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Jane Doe","email":"jane@example.com","password":"SecretPassword123"}'
  ```

---

### POST /users/login
Authenticates credentials, issues a signed JWT, and attaches it as an HTTP-Only cookie.

- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecretPassword123"
  }
  ```
- **Responses**:
  - `200 OK` (Includes `Set-Cookie: token=...`):
    ```json
    {
      "message": "Login successful",
      "user": {
        "id": 12,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user"
      }
    }
    ```
  - `401 Unauthorized`: `{ "message": "invalid email" }` or `{ "message": "password doesn't match" }`
- **cURL Example**:
  ```bash
  curl -i -X POST http://localhost:3000/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"jane@example.com","password":"SecretPassword123"}'
  ```

---

### POST /users/logout
Clears the session cookie on the client.

- **Access**: Authenticated (Requires valid `token` cookie)
- **Responses**:
  - `200 OK`:
    ```json
    { "message": "User successfully logged Out" }
    ```
- **cURL Example**:
  ```bash
  curl -X POST http://localhost:3000/users/logout \
    -b "token=your_jwt_cookie_value"
  ```

---

### GET /users/profile
Retrieves profile information for the authenticated user from the MySQL database.

- **Access**: Authenticated
- **Responses**:
  - `200 OK`:
    ```json
    {
      "user": {
        "id": 12,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user"
      }
    }
    ```
  - `404 Not Found`: `{ "message": "user id doesn't exist" }`

---

### PUT /users/profile
Updates the profile information (name and phone number) for the authenticated user.

- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "name": "Jane Doe Smith",
    "phone": "9876543210"
  }
  ```
- **Validation**:
  - `name`: Required non-empty string.
  - `phone`: Optional string.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "Profile updated successfully",
      "user": {
        "id": 12,
        "name": "Jane Doe Smith",
        "email": "jane@example.com",
        "role": "user"
      }
    }
    ```
  - `400 Bad Request`: `{ "message": "Name is required" }`

---

## 3. Product Catalog Endpoints (Public)

### GET /product
Fetches a paginated list of active products with search, category filtering, and sorting.

- **Access**: Public
- **Query Parameters**:
  | Parameter | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `page` | integer | `1` | Page number ($\ge 1$) |
  | `limit` | integer | `10` | Products per page ($\ge 1$) |
  | `search` | string | `""` | Search term matched against `name` & `description` |
  | `category`| string | `""` | Filter by category string |
  | `sortBy` | string | `price:DESC` | Sort formatted as `field:ORDER` (fields: `name`, `price`, `category`, `createdAt`; orders: `ASC`, `DESC`) |
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "Products fetched successfully",
      "products": [
        {
          "_id": "6710abcd1234ef5678901234",
          "name": "Wireless Noise-Canceling Headphones",
          "price": 14999,
          "stock": 25,
          "isActive": true,
          "images": ["headphones1.jpg", "headphones2.jpg"],
          "createdAt": "2026-10-15T10:00:00.000Z"
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1
      }
    }
    ```
- **cURL Example**:
  ```bash
  curl -X GET "http://localhost:3000/product?page=1&limit=5&category=electronics&sortBy=price:ASC"
  ```

---

### GET /product/categories
Returns an array of all distinct, non-empty categories present across the catalog.

- **Access**: Public
- **Responses**:
  - `200 OK`:
    ```json
    {
      "count": 4,
      "categories": ["appliances", "clothing", "electronics", "footwear"]
    }
    ```

---

### GET /product/:id
Retrieves an active product by its MongoDB `ObjectId`.

- **Access**: Public
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "Product fetched successfully",
      "product": {
        "_id": "6710abcd1234ef5678901234",
        "name": "Wireless Noise-Canceling Headphones",
        "price": 14999,
        "stock": 25,
        "isActive": true,
        "images": ["headphones1.jpg"]
      }
    }
    ```
  - `404 Not Found`: `{ "message": "Product not found" }`

---

## 4. Product Administration Endpoints (Admin Only)

### POST /product
Creates a new product record in MongoDB.

- **Access**: Admin (`authMiddleware` + `adminMiddleware`)
- **Request Body**:
  ```json
  {
    "name": "Mechanical Gaming Keyboard",
    "price": 6999,
    "stock": 50,
    "category": "electronics",
    "brand": "Keychron",
    "description": "RGB mechanical keyboard with hot-swappable switches",
    "images": ["keyboard1.jpg", "keyboard2.jpg"]
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "message": "Product created successfully",
      "products": {
        "_id": "6710ffaa9876ef5432101234",
        "name": "Mechanical Gaming Keyboard",
        "price": 6999,
        "stock": 50,
        "isActive": true
      }
    }
    ```
  - `400 Bad Request`: `{ "message": "Required product details are missing" }`

---

### PUT /product/:id
Updates product details, modifies stock levels, or toggles active status.

- **Access**: Admin
- **Request Body**: Partial product update object (e.g. `{ "price": 5999, "stock": 45, "isActive": false }`).
- **Responses**:
  - `200 OK`: `{ "message": "Product updated successfully", "product": { ... } }`
  - `404 Not Found`: `{ "message": "Product not found" }`

---

### DELETE /product/:id
Hard deletes a product from the database.

- **Access**: Admin
- **Responses**:
  - `200 OK`: `{ "message": "Product deleted successfully" }`
  - `404 Not Found`: `{ "message": "Product not found" }`

---

### GET /product/admin/all
Fetches all products regardless of `isActive` flag, sorted newest first.

- **Access**: Admin
- **Responses**:
  - `200 OK`: `{ "success": true, "products": [ ... ] }`

---

## 5. Shopping Cart Endpoints

### GET /cart
Retrieves the authenticated user's active shopping cart with populated product data. Automatically purges references to products that have been deleted from the database.

- **Access**: Authenticated
- **Responses**:
  - `200 OK`:
    ```json
    {
      "cartDetails": {
        "_id": "6711aaaa1111bb2222cc3333",
        "userId": 12,
        "items": [
          {
            "_id": "6711bbbb1111bb2222cc3333",
            "quantity": 2,
            "productId": {
              "_id": "6710abcd1234ef5678901234",
              "name": "Wireless Noise-Canceling Headphones",
              "price": 14999,
              "stock": 25,
              "isActive": true
            }
          }
        ]
      }
    }
    ```
  - `404 Not Found`: `{ "message": "Not Found!" }`

---

### POST /cart
Adds a product to the user's cart or increments the quantity if already present. Verifies stock availability.

- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "productId": "6710abcd1234ef5678901234",
    "quantity": 1
  }
  ```
- **Responses**:
  - `201 Created`: `{ "message": "successfully added the product to cart" }`
  - `400 Bad Request`: `{ "message": "Insufficient stock available" }`
  - `404 Not Found`: `{ "message": "product doesn't exist" }`

---

### PUT /cart/:productId
Updates the absolute quantity of a specific item in the cart.

- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Responses**:
  - `200 OK`: `{ "message": "Quantity updated successfully" }`
  - `400 Bad Request`: `{ "message": "Insufficient stock availability" }`

---

### DELETE /cart/:productId
Removes a specific product from the cart.

- **Access**: Authenticated
- **Responses**:
  - `200 OK`: `{ "message": "successfully deleted the product", "cart": { ... } }`
  - `404 Not Found`: `{ "message": "Product not found in cart" }`

---

## 6. Customer Order Endpoints

### POST /order (COD)
Places an order with Cash on Delivery (COD) payment method. Executes within an ACID transaction: validates cart, locks stock, creates order, and clears cart items.

- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "shippingAddress": {
      "name": "Jane Doe",
      "address": "42 Tech Boulevard, Flat 3B",
      "city": "Bengaluru",
      "state": "Karnataka",
      "pincode": "560001",
      "phone": "9876543210"
    },
    "checkoutAttemptId": "7b0d879e-4e6f-4a0b-932f-410cead8346f"
  }
  ```
- **Address Validation Rules**:
  - `pincode`: Must match regex `/^\d{6}$/` (6 digits).
  - `phone`: Must match regex `/^\d{10}$/` (10 digits).
  - All address fields (`name`, `address`, `city`, `state`, `pincode`, `phone`) are mandatory.
  - `checkoutAttemptId`: Must be a non-empty string.
- **Responses**:
  - `201 Created`:
    ```json
    {
      "success": true,
      "message": "Order placed successfully",
      "order": {
        "_id": "671234567890abcdef123456",
        "userId": 12,
        "totalAmount": 34998,
        "shippingAmount": 5000,
        "paymentMethod": "COD",
        "paymentStatus": "pending",
        "orderStatus": "processing",
        "stockReserved": true,
        "checkoutAttemptId": "7b0d879e-4e6f-4a0b-932f-410cead8346f"
      }
    }
    ```
  - `400 Bad Request`: `{ "message": "Insufficient stock or item became unavailable..." }`

---

### GET /order
Retrieves all orders placed by the currently authenticated user, sorted newest first.

- **Access**: Authenticated
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "orders": [ ... ]
    }
    ```

---

### GET /order/:orderId
Retrieves a specific order. Enforces ownership: users can only fetch their own orders (`userId: req.user.id`).

- **Access**: Authenticated
- **Responses**:
  - `200 OK`: `{ "success": true, "order": { ... } }`
  - `404 Not Found`: `{ "message": "Order not found." }`

---

### PUT /order/cancel/:orderId
Cancels an order in `pending` or `processing` state. Restores reserved inventory stock to the product catalog atomically and creates a refund via Stripe if the order was paid.

- **Access**: Authenticated (Owner of order)
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "Order cancelled successfully.",
      "order": {
        "_id": "671234567890abcdef123456",
        "orderStatus": "cancelled",
        "paymentStatus": "refunded",
        "stockReserved": false
      }
    }
    ```
  - `400 Bad Request`: `{ "message": "Cannot cancel order with status 'shipped'." }`
  - `404 Not Found`: `{ "message": "Order not found." }`

---

## 7. Order Administration Endpoints (Admin Only)

### GET /admin/order
Lists all customer orders across the platform.

- **Access**: Admin
- **Responses**:
  - `200 OK`: `{ "success": true, "orders": [ ... ] }`

---

### PUT /admin/order/:orderId
Transitions order status strictly through allowed state machine paths:
- `pending` $\rightarrow$ `["processing", "cancelled"]`
- `processing` $\rightarrow$ `["shipped", "cancelled"]`
- `shipped` $\rightarrow$ `["delivered"]`
- `delivered` $\rightarrow$ `[]` (Terminal)
- `cancelled` $\rightarrow$ `[]` (Terminal)

- **Access**: Admin
- **Request Body**:
  ```json
  {
    "orderStatus": "shipped"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true, "message": "Order status updated successfully", "order": { ... } }`
  - `400 Bad Request`: `{ "success": false, "message": "Cannot change order status from 'shipped' to 'processing'." }`

---

## 8. Payment & Stripe Webhook Endpoints

### POST /payments/create-intent
Initializes a Stripe payment session. Atomically validates cart, reserves inventory, creates an order in `pending` state, and registers a `PaymentIntent` with Stripe.

- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "shippingAddress": {
      "name": "Jane Doe",
      "address": "42 Tech Boulevard",
      "city": "Bengaluru",
      "state": "Karnataka",
      "pincode": "560001",
      "phone": "9876543210"
    },
    "checkoutAttemptId": "8c1e980f-5f7a-4b1c-9430-521dfe94570a"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "clientSecret": "pi_3MtwBwLkdIwHu7ix28a3tqPa_secret_YrKJ...",
      "paymentIntentId": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
      "orderId": "671234567890abcdef123456"
    }
    ```
  - `400 Bad Request`: `{ "message": "A valid checkout attempt ID is required." }`
  - `409 Conflict`: `{ "message": "This checkout can no longer accept payment." }`

---

### POST /payments/webhook
Asynchronous callback handler invoked by Stripe. Requires raw unparsed body for cryptographic HMAC SHA-256 signature verification. Enforces idempotency via `ProcessedEvent`.

- **Access**: Stripe Webhook Service Only
- **Headers**:
  - `stripe-signature`: Required HMAC signature header.
- **Handled Event Types**:
  1. `payment_intent.succeeded`: Marks order as `paid` and `processing`, records payment transaction.
  2. `payment_intent.canceled`: Restores reserved stock, marks order as `cancelled` and payment as `failed`.
  3. `payment_intent.payment_failed`: Logs failed payment attempt, leaves reservation active for retry.
- **Responses**:
  - `200 OK`: Event received and processed (or duplicate acknowledged).
  - `400 Bad Request`: Missing signature or signature verification failed.
  - `500 Internal Server Error`: Transient failure triggering Stripe retry.

---

## 9. Wishlist Endpoints

### GET /wishlist
Retrieves all bookmarked products for the authenticated user with populated product details.

- **Access**: Authenticated
- **Responses**:
  - `200 OK`:
    ```json
    {
      "items": [
        {
          "_id": "6713aaaa1234bb5678cc9012",
          "productId": {
            "_id": "6710abcd1234ef5678901234",
            "name": "Wireless Noise-Canceling Headphones",
            "price": 14999
          }
        }
      ]
    }
    ```

---

### POST /wishlist/:productId
Adds a product to the user's wishlist. Prevents duplicate additions.

- **Access**: Authenticated
- **Responses**:
  - `200 OK` / `201 Created`: `{ "message": "Product added to wishlist", "wishlist": { ... } }`
  - `400 Bad Request`: `{ "message": "Product already exists in wishlist" }`
  - `404 Not Found`: `{ "message": "product doesn't exist" }`

---

### DELETE /wishlist/:productId
Removes a product from the user's wishlist.

- **Access**: Authenticated
- **Responses**:
  - `200 OK`: `{ "message": "Product removed from wishlist", "wishlist": { ... } }`
  - `404 Not Found`: `{ "message": "Product not found in wishlist" }`
