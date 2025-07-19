// tests/integration/database-errors.test.js
// Este archivo debe ejecutarse de forma aislada ya que mockea la conexión a la base de datos

// Mock the database module to simulate connection errors
// Importante: Este mock debe hacerse ANTES de cargar cualquier otro módulo
jest.mock('../../src/config/database', () => {
  const mockError = new Error('Database connection error');
  mockError.code = 'ECONNREFUSED';
  
  return {
    pool: {
      query: jest.fn().mockRejectedValue(mockError),
      getConnection: jest.fn().mockRejectedValue(mockError)
    },
    testConnection: jest.fn().mockResolvedValue(true)
  };
});

// Ahora cargamos los demás módulos
const request = require('supertest');
const app = require('../../src/app');

describe('Database Error Handling Integration Tests', () => {
  // Test database connection error handling
  describe('Database Connection Errors', () => {
    it('should handle database errors when creating a word', async () => {
      const response = await request(app)
        .post('/api/palabra')
        .send({ palabra: 'test' })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle database errors when getting a word', async () => {
      const response = await request(app)
        .get('/api/palabra/1')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle database errors when listing words', async () => {
      const response = await request(app)
        .get('/api/palabras')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle database errors when searching words', async () => {
      const response = await request(app)
        .get('/api/palabras/buscar?texto=test')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle database errors in admin operations', async () => {
      const response = await request(app)
        .get('/api/admin/estadisticas')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});