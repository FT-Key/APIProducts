const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Products API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0f0f0f; color: #e0e0e0; padding: 2rem; line-height: 1.6; }
    h1 { color: #4fc3f7; margin-bottom: 0.5rem; font-size: 2rem; }
    h2 { color: #81d4fa; margin-top: 2rem; margin-bottom: 0.5rem; font-size: 1.3rem; }
    h3 { color: #b3e5fc; margin-top: 1.5rem; margin-bottom: 0.3rem; }
    p { margin-bottom: 0.5rem; }
    .desc { color: #90a4ae; margin-bottom: 1.5rem; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-left: 6px; }
    .auth-yes { background: #4caf50; color: #fff; }
    .auth-no { background: #ff9800; color: #000; }
    code { background: #1e1e1e; padding: 2px 6px; border-radius: 4px; font-size: 0.9rem; color: #80cbc4; }
    pre { background: #1a1a2e; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 0.5rem 0; border: 1px solid #333; }
    pre code { background: none; padding: 0; color: #c5e1a5; }
    .endpoint { background: #1a1a2e; border: 1px solid #333; border-radius: 8px; padding: 1rem; margin: 0.8rem 0; }
    .endpoint-header { display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem; }
    .method { display: inline-block; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; }
    .get { background: #2196f3; color: #fff; }
    .post { background: #4caf50; color: #fff; }
    .put { background: #ff9800; color: #000; }
    .delete { background: #f44336; color: #fff; }
    ul { margin-left: 1.5rem; margin-bottom: 0.5rem; }
    li { margin-bottom: 0.3rem; }
    .rate { color: #ffb74d; margin-top: 1rem; padding: 0.8rem; background: #1a1a2e; border-radius: 8px; border: 1px solid #333; }
  </style>
</head>
<body>
  <h1>Products API</h1>
  <p class="desc">A simple CRUD API to practice fetch and async/await with JWT authentication.</p>

  <h2>How it works</h2>
  <ol>
    <li><code>POST /api/auth/token</code> to get your JWT token.</li>
    <li>Save that token. You need it for ALL product endpoints.</li>
    <li>In every request, send the header: <code>Authorization: Bearer &lt;token&gt;</code></li>
    <li>Your products are filtered by your token. You only see your own.</li>
  </ol>

  <div class="rate">
    <strong>Rate Limit:</strong> 200 requests / 15 min (general) &middot; 10 requests / 15 min (auth)
  </div>

  <h2>Endpoints</h2>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method post">POST</span>
      <span>/api/auth/token</span>
      <span class="badge auth-no">No Auth</span>
    </div>
    <p>Creates a JWT token to use in the API. No body needed.</p>
    <pre><code>{ "token": "eyJhbG..." }</code></pre>
  </div>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method get">GET</span>
      <span>/api/products</span>
      <span class="badge auth-yes">Auth</span>
    </div>
    <p>Returns all your products.</p>
  </div>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method get">GET</span>
      <span>/api/products/:id</span>
      <span class="badge auth-yes">Auth</span>
    </div>
    <p>Returns a product by its ID.</p>
  </div>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method post">POST</span>
      <span>/api/products</span>
      <span class="badge auth-yes">Auth</span>
    </div>
    <p>Creates a new product.</p>
    <p><strong>Body:</strong></p>
    <pre><code>{
  "name": "string (required)",
  "price": "number (required)",
  "description": "string (optional)",
  "imgUrl": "string (optional, must be valid HTTP/HTTPS URL)",
  "stock": "number (optional)"
}</code></pre>
  </div>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method put">PUT</span>
      <span>/api/products/:id</span>
      <span class="badge auth-yes">Auth</span>
    </div>
    <p>Updates a product.</p>
    <p><strong>Body:</strong></p>
    <pre><code>{
  "name": "string",
  "price": "number",
  "description": "string",
  "imgUrl": "string (must be valid HTTP/HTTPS URL)",
  "stock": "number"
}</code></pre>
  </div>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method delete">DELETE</span>
      <span>/api/products/:id</span>
      <span class="badge auth-yes">Auth</span>
    </div>
    <p>Soft delete: deactivates the product (does not remove it).</p>
  </div>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method delete">DELETE</span>
      <span>/api/products/:id/physical</span>
      <span class="badge auth-yes">Auth</span>
    </div>
    <p>Hard delete: removes the product from the database.</p>
  </div>

  <h2>Examples</h2>

  <h3>Get Token</h3>
  <pre><code>const res = await fetch('/api/auth/token', { method: 'POST' });
const { token } = await res.json();</code></pre>

  <h3>Create Product</h3>
  <pre><code>const res = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ name: 'Pencil', price: 50 })
});
const product = await res.json();</code></pre>

  <h3>Get All Products</h3>
  <pre><code>const res = await fetch('/api/products', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const products = await res.json();</code></pre>

  <h3>Get Product by ID</h3>
  <pre><code>const res = await fetch('/api/products/123abc', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const product = await res.json();</code></pre>

  <h3>Update Product</h3>
  <pre><code>const res = await fetch('/api/products/123abc', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ price: 75 })
});
const updated = await res.json();</code></pre>

  <h3>Soft Delete</h3>
  <pre><code>const res = await fetch('/api/products/123abc', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer ' + token }
});</code></pre>

  <h3>Hard Delete</h3>
  <pre><code>const res = await fetch('/api/products/123abc/physical', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer ' + token }
});</code></pre>
</body>
</html>`);
});

module.exports = router;
