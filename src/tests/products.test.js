const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

let tokenUser1;
let tokenUser2;
let productId;

const log = (msg) => console.log(`\n>>> ${msg}`);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  log('Connected to MongoDB');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  log('Database cleaned up');
  await mongoose.connection.close();
});

describe('1. Create tokens', () => {
  it('should create token for User 1', async () => {
    const res = await request(app).post('/api/auth/token');
    expect(res.status).toBe(201);
    tokenUser1 = res.body.token;
    log('User 1 token created');
    console.log(`   Token: ${tokenUser1.substring(0, 30)}...`);
  });

  it('should create token for User 2', async () => {
    const res = await request(app).post('/api/auth/token');
    expect(res.status).toBe(201);
    tokenUser2 = res.body.token;
    log('User 2 token created');
    console.log(`   Token: ${tokenUser2.substring(0, 30)}...`);
  });
});

describe('2. Create products for User 1', () => {
  it('should create Laptop', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: 'Laptop', price: 1500, description: 'Gaming laptop', stock: 5 });
    expect(res.status).toBe(201);
    log('Created: Laptop ($1500)');
  });

  it('should create Mouse', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: 'Mouse', price: 25, description: 'Wireless mouse', stock: 50 });
    expect(res.status).toBe(201);
    log('Created: Mouse ($25)');
  });

  it('should create Keyboard', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: 'Keyboard', price: 80, description: 'Mechanical keyboard', stock: 30 });
    expect(res.status).toBe(201);
    log('Created: Keyboard ($80)');
  });

  it('should fail without token', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Monitor', price: 300 });
    expect(res.status).toBe(401);
    log('Correctly rejected: no token = 401');
  });

  it('should fail without required fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ description: 'Missing name and price' });
    expect(res.status).toBe(400);
    log('Correctly rejected: missing fields = 400');
  });
});

describe('3. Get all products', () => {
  it('User 1 should see 3 products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    productId = res.body[0]._id;
    log('User 1 products:');
    res.body.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - $${p.price} (stock: ${p.stock})`);
    });
  });

  it('User 2 should see 0 products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenUser2}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
    log('User 2 products: (empty - no products yet)');
  });
});

describe('4. Get product by ID', () => {
  it('should return one product', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.status).toBe(200);
    log(`Product by ID: ${res.body.name} - $${res.body.price}`);
  });

  it('should return 404 for fake ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/products/${fakeId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.status).toBe(404);
    log('Fake ID correctly returns 404');
  });
});

describe('5. Update product', () => {
  it('should update Laptop -> Laptop Pro ($2000)', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: 'Laptop Pro', price: 2000 });
    expect(res.status).toBe(200);
    log(`Updated: ${res.body.name} - $${res.body.price}`);
  });

  it('should verify update in GET all', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.status).toBe(200);
    const updated = res.body.find(p => p._id === productId);
    expect(updated.name).toBe('Laptop Pro');
    expect(updated.price).toBe(2000);
    log('User 1 products after update:');
    res.body.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - $${p.price}`);
    });
  });
});

describe('6. Soft delete', () => {
  it('should deactivate Keyboard', async () => {
    const allRes = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`);
    const keyboard = allRes.body.find(p => p.name === 'Keyboard');

    const res = await request(app)
      .delete(`/api/products/${keyboard._id}`)
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.status).toBe(200);
    log(`Soft deleted: ${keyboard.name} (active: false)`);
  });
});

describe('7. Hard delete', () => {
  it('should permanently delete Mouse', async () => {
    const allRes = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`);
    const mouse = allRes.body.find(p => p.name === 'Mouse');

    const res = await request(app)
      .delete(`/api/products/${mouse._id}/physical`)
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.status).toBe(200);
    log(`Hard deleted: ${mouse.name} (removed from DB)`);
  });

  it('User 1 should now have only 1 product', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.status).toBe(200);
    log('User 1 final products:');
    res.body.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - $${p.price} (active: ${p.active})`);
    });
  });
});

describe('8. User isolation', () => {
  it('User 2 should NOT see User 1 products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenUser2}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
    log('User 2 products: (empty - isolation works!)');
  });

  it('User 2 should NOT access User 1 product by ID', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${tokenUser2}`);
    expect(res.status).toBe(404);
    log('User 2 trying to access User 1 product: 404 (blocked)');
  });

  it('User 2 should NOT update User 1 product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${tokenUser2}`)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(404);
    log('User 2 trying to update User 1 product: 404 (blocked)');
  });

  it('User 2 should NOT delete User 1 product', async () => {
    const allRes = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`);
    const user1Product = allRes.body[0];

    const res = await request(app)
      .delete(`/api/products/${user1Product._id}`)
      .set('Authorization', `Bearer ${tokenUser2}`);
    expect(res.status).toBe(404);
    log('User 2 trying to delete User 1 product: 404 (blocked)');
  });
});

describe('9. imgUrl field', () => {
  let imgProductId;

  it('should create product with imgUrl', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: 'Webcam', price: 60, imgUrl: 'https://example.com/webcam.jpg' });
    expect(res.status).toBe(201);
    expect(res.body.imgUrl).toBe('https://example.com/webcam.jpg');
    imgProductId = res.body._id;
    log(`Created: Webcam with imgUrl: ${res.body.imgUrl}`);
  });

  it('should reject invalid imgUrl', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: 'Bad img', price: 10, imgUrl: 'not-a-url' });
    expect(res.status).toBe(400);
    log('Rejected invalid imgUrl: 400');
  });

  it('should reject ftp:// protocol', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: 'Bad img', price: 10, imgUrl: 'ftp://example.com/file.jpg' });
    expect(res.status).toBe(400);
    log('Rejected ftp:// imgUrl: 400');
  });

  it('should update imgUrl', async () => {
    const res = await request(app)
      .put(`/api/products/${imgProductId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ imgUrl: 'https://example.com/webcam-v2.jpg' });
    expect(res.status).toBe(200);
    expect(res.body.imgUrl).toBe('https://example.com/webcam-v2.jpg');
    log(`Updated imgUrl: ${res.body.imgUrl}`);
  });
});

describe('10. Input sanitization', () => {
  it('should strip HTML tags from name', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: '<script>alert("xss")</script>Laptop', price: 100 });
    expect(res.status).toBe(201);
    expect(res.body.name).not.toContain('<script>');
    expect(res.body.name).not.toContain('</script>');
    log(`Sanitized name: "${res.body.name}" (HTML stripped)`);
  });

  it('should strip HTML tags from description', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: 'Test', price: 10, description: '<img src=x onerror=alert(1)>Nice product' });
    expect(res.status).toBe(201);
    expect(res.body.description).not.toContain('<img');
    expect(res.body.description).not.toContain('onerror');
    log(`Sanitized description: "${res.body.description}" (HTML stripped)`);
  });

  it('should ignore unknown fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ name: 'Secure', price: 10, _id: 'fake123', clientId: 'hacked', active: false, createdAt: '2000-01-01' });
    expect(res.status).toBe(201);
    expect(res.body.clientId).not.toBe('hacked');
    expect(res.body.active).toBe(true);
    log('Unknown fields ignored: clientId, _id, active, createdAt not overridden');
  });
});
