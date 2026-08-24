# Products API

A simple CRUD API for products, built with Node.js, Express, MongoDB and JWT authentication. Designed for practicing **fetch** and **async/await**.

## How it works

1. `POST /api/auth/token` — Get a JWT token (no username/password needed).
2. Save the token. You need it for every product request.
3. Send the token in the `Authorization: Bearer <token>` header.
4. Your products are filtered by your token. You only see your own.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### Install & Run

```bash
npm install
npm run dev
```

The server starts at `http://localhost:3000`.

### Environment Variables

Create a `.env` file:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/api_products
JWT_SECRET=your_secret_key_here
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | API documentation |
| POST | `/api/auth/token` | No | Create a JWT token |
| GET | `/api/products` | Yes | Get all your products |
| GET | `/api/products/:id` | Yes | Get a product by ID |
| POST | `/api/products` | Yes | Create a product |
| PUT | `/api/products/:id` | Yes | Update a product |
| DELETE | `/api/products/:id` | Yes | Soft delete (deactivates) |
| DELETE | `/api/products/:id/physical` | Yes | Hard delete (removes from DB) |

## Rate Limiting

- **General**: 200 requests per 15 minutes per IP.
- **Auth endpoint**: 10 requests per 15 minutes per IP.

## Examples with Fetch

### Get Token

```javascript
const res = await fetch('/api/auth/token', { method: 'POST' });
const { token } = await res.json();
```

### Create Product

```javascript
const res = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ name: 'Pencil', price: 50 })
});
const product = await res.json();
```

### Get All Products

```javascript
const res = await fetch('/api/products', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const products = await res.json();
```

### Get Product by ID

```javascript
const res = await fetch('/api/products/123abc', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const product = await res.json();
```

### Update Product

```javascript
const res = await fetch('/api/products/123abc', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ price: 75 })
});
const updated = await res.json();
```

### Soft Delete

```javascript
const res = await fetch('/api/products/123abc', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

### Hard Delete

```javascript
const res = await fetch('/api/products/123abc/physical', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (jsonwebtoken)
- **CORS**: Enabled for all origins
- **Rate Limiting**: express-rate-limit
