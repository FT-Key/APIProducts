const express = require('express');
const router = express.Router();

router.get('/favicon.ico', (req, res) => {
  res.redirect('/favicon.png');
});

router.get('/', (req, res) => {
  res.json({
    name: 'Products API',
    description: 'A simple CRUD API to practice fetch and async/await with JWT authentication.',
    rateLimit: {
      general: '200 requests per 15 minutes per IP',
      auth: '10 requests per 15 minutes per IP'
    },
    howItWorks: [
      '1. POST to /api/auth/token to get your JWT token.',
      '2. Save that token. You need it for ALL product endpoints.',
      '3. In every request, send the header: Authorization: Bearer <your_token>',
      '4. Your products are filtered by your token. You only see your own.'
    ],
    endpoints: {
      'POST /api/auth/token': {
        description: 'Creates a JWT token to use in the API',
        auth: false,
        body: 'No body needed',
        response: '{ "token": "eyJhbG..." }'
      },
      'GET /api/products': {
        description: 'Returns all your products',
        auth: true,
        response: '[{ "_id", "name", "price", "description", "stock", "active", "clientId", "createdAt", "updatedAt" }]'
      },
      'GET /api/products/:id': {
        description: 'Returns a product by its ID',
        auth: true,
        response: '{ "_id", "name", "price", "description", "stock", "active", "clientId", "createdAt", "updatedAt" }'
      },
      'POST /api/products': {
        description: 'Creates a new product',
        auth: true,
        body: '{ "name": "string (required)", "price": "number (required)", "description": "string (optional)", "stock": "number (optional)" }',
        response: '{ "_id", "name", "price", "description", "stock", "active", "clientId", "createdAt", "updatedAt" }'
      },
      'PUT /api/products/:id': {
        description: 'Updates a product',
        auth: true,
        body: '{ "name": "string", "price": "number", "description": "string", "stock": "number" }',
        response: '{ "_id", "name", "price", "description", "stock", "active", "clientId", "createdAt", "updatedAt" }'
      },
      'DELETE /api/products/:id': {
        description: 'Soft delete: deactivates the product (does not remove it)',
        auth: true,
        response: '{ "message": "Product deactivated (soft delete)", "product": { ... } }'
      },
      'DELETE /api/products/:id/physical': {
        description: 'Hard delete: removes the product from the database',
        auth: true,
        response: '{ "message": "Product permanently deleted" }'
      }
    },
    examples: {
      getToken: "fetch('/api/auth/token', { method: 'POST' }).then(r => r.json())",
      createProduct: "fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ name: 'Pencil', price: 50 }) }).then(r => r.json())",
      getAllProducts: "fetch('/api/products', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json())",
      getProductById: "fetch('/api/products/123abc', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json())",
      updateProduct: "fetch('/api/products/123abc', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ price: 75 }) }).then(r => r.json())",
      softDelete: "fetch('/api/products/123abc', { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json())",
      hardDelete: "fetch('/api/products/123abc/physical', { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json())"
    }
  });
});

module.exports = router;
