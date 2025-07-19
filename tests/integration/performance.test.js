// tests/integration/performance.test.js
// Load test environment first
require('./test-env');

const request = require('supertest');
const app = require('../../src/app');
const { setupTestDb, teardownTestDb } = require('./setup');

// Esta prueba es opcional y puede ser omitida en entornos CI
// ya que puede consumir muchos recursos
// Por defecto, saltamos estas pruebas para evitar problemas
const SKIP_PERFORMANCE_TESTS = process.env.RUN_PERFORMANCE_TESTS !== 'true';

describe('Performance and Concurrency Tests', () => {
  // Setup and teardown for all tests
  beforeAll(async () => {
    if (SKIP_PERFORMANCE_TESTS) return;
    await setupTestDb();
  });

  afterAll(async () => {
    if (SKIP_PERFORMANCE_TESTS) return;
    await teardownTestDb();
  });

  // Test for response time
  describe('Response Time', () => {
    it('should respond to simple requests within acceptable time', async () => {
      if (SKIP_PERFORMANCE_TESTS) {
        console.log('Skipping performance tests');
        return;
      }

      const startTime = Date.now();
      
      await request(app)
        .get('/api/palabras')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // La respuesta debería ser menor a 200ms
      // Este valor puede ajustarse según las expectativas del proyecto
      expect(responseTime).toBeLessThan(200);
    });
  });

  // Test for high load
  describe('High Load Handling', () => {
    it('should handle multiple sequential requests', async () => {
      if (SKIP_PERFORMANCE_TESTS) return;
      
      const numRequests = 20;
      const startTime = Date.now();
      
      // Realizar múltiples solicitudes secuenciales
      for (let i = 0; i < numRequests; i++) {
        await request(app)
          .post('/api/palabra')
          .send({ palabra: `perf-test-${i}` })
          .expect(200);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / numRequests;
      
      console.log(`Average time per request: ${avgTimePerRequest}ms`);
      
      // El tiempo promedio por solicitud debería ser razonable
      // Este valor puede ajustarse según las expectativas del proyecto
      expect(avgTimePerRequest).toBeLessThan(100);
    });

    it('should handle concurrent requests efficiently', async () => {
      if (SKIP_PERFORMANCE_TESTS) return;
      
      const numRequests = 20;
      const startTime = Date.now();
      
      // Realizar múltiples solicitudes concurrentes
      const promises = [];
      for (let i = 0; i < numRequests; i++) {
        promises.push(
          request(app)
            .post('/api/palabra')
            .send({ palabra: `concurrent-perf-${i}` })
        );
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`Total time for ${numRequests} concurrent requests: ${totalTime}ms`);
      
      // El tiempo total debería ser significativamente menor que el tiempo
      // que tomaría hacer las solicitudes secuencialmente
      // Este valor puede ajustarse según las expectativas del proyecto
      expect(totalTime).toBeLessThan(numRequests * 50);
    });
  });

  // Test for database connection pool efficiency
  describe('Connection Pool Efficiency', () => {
    it('should handle multiple database operations efficiently', async () => {
      if (SKIP_PERFORMANCE_TESTS) return;
      
      const numOperations = 10;
      const startTime = Date.now();
      
      // Realizar múltiples operaciones que involucran la base de datos
      const promises = [];
      
      // Crear palabras
      for (let i = 0; i < numOperations; i++) {
        promises.push(
          request(app)
            .post('/api/palabra')
            .send({ palabra: `pool-test-${i}` })
        );
      }
      
      // Buscar palabras
      promises.push(
        request(app)
          .get('/api/palabras/buscar?texto=pool-test')
      );
      
      // Obtener estadísticas
      promises.push(
        request(app)
          .get('/api/admin/estadisticas')
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`Total time for ${promises.length} mixed database operations: ${totalTime}ms`);
      
      // El tiempo total debería ser razonable, indicando que el pool de conexiones
      // está funcionando eficientemente
      expect(totalTime).toBeLessThan(promises.length * 100);
    });
  });
});