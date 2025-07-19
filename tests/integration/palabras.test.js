// tests/integration/palabras.test.js
// Load test environment first
require('./test-env');

const request = require('supertest');
const app = require('../../src/app');
const { setupTestDb, teardownTestDb } = require('./setup');

describe('Palabras API Integration Tests', () => {
  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  // Test for POST /api/palabra - Create a new word
  describe('POST /api/palabra', () => {
    it('should create a new word and return its representation', async () => {
      const response = await request(app)
        .post('/api/palabra')
        .send({ palabra: 'integration' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('palabra', 'integration');
    });

    it('should update counter when sending an existing word', async () => {
      // First request to create the word
      await request(app)
        .post('/api/palabra')
        .send({ palabra: 'duplicate' })
        .expect(200);

      // Second request to update the counter
      const response = await request(app)
        .post('/api/palabra')
        .send({ palabra: 'duplicate' })
        .expect(200);

      expect(response.body).toHaveProperty('contador_uso');
      expect(response.body.contador_uso).toBeGreaterThan(1);
    });

    it('should return 400 when sending invalid input', async () => {
      const response = await request(app)
        .post('/api/palabra')
        .send({ palabra: '' }) // Empty word
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Test for GET /api/palabra/:id - Get a word by ID
  describe('GET /api/palabra/:id', () => {
    let wordId;

    // Create a word to test with
    beforeAll(async () => {
      const response = await request(app)
        .post('/api/palabra')
        .send({ palabra: 'getbyid' });

      wordId = response.body.id;
    });

    it('should get a word by its ID', async () => {
      const response = await request(app)
        .get(`/api/palabra/${wordId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', wordId);
      expect(response.body).toHaveProperty('palabra', 'getbyid');
    });

    it('should return 404 when word does not exist', async () => {
      const response = await request(app)
        .get('/api/palabra/9999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when ID is invalid', async () => {
      const response = await request(app)
        .get('/api/palabra/invalid')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Test for GET /api/palabras - List words with pagination
  describe('GET /api/palabras', () => {
    it('should list words with default pagination', async () => {
      const response = await request(app)
        .get('/api/palabras')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should list words with custom pagination', async () => {
      const response = await request(app)
        .get('/api/palabras?pagina=1&limite=2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);
    });

    it('should return 400 when pagination parameters are invalid', async () => {
      const response = await request(app)
        .get('/api/palabras?pagina=invalid&limite=2')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Test for GET /api/palabras/buscar - Search words
  describe('GET /api/palabras/buscar', () => {
    beforeAll(async () => {
      // Create some words to search for
      await request(app).post('/api/palabra').send({ palabra: 'searchable' });
      await request(app).post('/api/palabra').send({ palabra: 'searching' });
      await request(app).post('/api/palabra').send({ palabra: 'nonsearch' });
    });

    it('should search words by text', async () => {
      const response = await request(app)
        .get('/api/palabras/buscar?texto=search')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      // Check that all returned words contain 'search'
      response.body.forEach(word => {
        expect(word.palabra.toLowerCase()).toContain('search');
      });
    });

    it('should return empty array when no matches found', async () => {
      const response = await request(app)
        .get('/api/palabras/buscar?texto=nonexistent')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  // Test for DELETE /api/admin/palabra/:id - Delete a word (admin)
  describe('DELETE /api/admin/palabra/:id', () => {
    let wordId;

    // Create a word to delete
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/palabra')
        .send({ palabra: `delete-${Date.now()}` });

      wordId = response.body.id;
    });

    it('should delete a word by its ID', async () => {
      // Delete the word
      await request(app)
        .delete(`/api/admin/palabra/${wordId}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/palabra/${wordId}`)
        .expect(404);
    });

    it('should return 404 when trying to delete non-existent word', async () => {
      const response = await request(app)
        .delete('/api/admin/palabra/9999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Test for PUT /api/admin/palabra/:id - Update a word (admin)
  describe('PUT /api/admin/palabra/:id', () => {
    let wordId;

    // Create a word to update
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/palabra')
        .send({ palabra: `update-${Date.now()}` });

      wordId = response.body.id;
    });

    it('should update a word by its ID', async () => {
      const updateData = {
        representacion: '***updated***'
      };

      // Update the word
      const updateResponse = await request(app)
        .put(`/api/admin/palabra/${wordId}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updateResponse.body).toHaveProperty('representacion', '***updated***');

      // Verify it's updated
      const getResponse = await request(app)
        .get(`/api/palabra/${wordId}`)
        .expect(200);

      expect(getResponse.body).toHaveProperty('representacion', '***updated***');
    });

    it('should return 404 when trying to update non-existent word', async () => {
      const response = await request(app)
        .put('/api/admin/palabra/9999')
        .send({ representacion: 'updated' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when update data is invalid', async () => {
      const response = await request(app)
        .put(`/api/admin/palabra/${wordId}`)
        .send({ invalid: 'data' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Test for GET /api/admin/estadisticas - Get statistics (admin)
  describe('GET /api/admin/estadisticas', () => {
    it('should get usage statistics', async () => {
      const response = await request(app)
        .get('/api/admin/estadisticas')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('total_palabras');
      expect(response.body).toHaveProperty('total_usos');
      expect(response.body).toHaveProperty('palabras_mas_utilizadas');
      expect(response.body).toHaveProperty('ultimas_consultadas');

      expect(Array.isArray(response.body.palabras_mas_utilizadas)).toBe(true);
      expect(Array.isArray(response.body.ultimas_consultadas)).toBe(true);
    });
  });

  // Test for error handling
  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Ruta no encontrada');
    });
  });
});