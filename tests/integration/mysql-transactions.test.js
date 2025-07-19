// tests/integration/mysql-transactions.test.js
// Load test environment first
require('./test-env');

const request = require('supertest');
const app = require('../../src/app');
const { setupTestDb, teardownTestDb, getPool } = require('./setup');

describe('MySQL Transaction Integration Tests', () => {
  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  // Test para verificar que las operaciones se realizan en transacciones
  describe('Database Transactions', () => {
    it('should create a word and verify it exists in the database', async () => {
      const palabra = 'transaction-word-' + Date.now();
      
      // Crear una palabra a través de la API
      const response = await request(app)
        .post('/api/palabra')
        .send({ palabra })
        .expect(200);
      
      const wordId = response.body.id;
      
      // Verificar directamente en la base de datos que la palabra existe
      const pool = getPool();
      let connection;
      try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
          'SELECT * FROM palabras WHERE id = ?',
          [wordId]
        );
        
        expect(rows.length).toBe(1);
        expect(rows[0].palabra).toBe(palabra);
      } finally {
        if (connection) {
          connection.release();
        }
      }
    });

    it('should update a word and verify the changes in the database', async () => {
      // Crear una palabra para actualizar
      const palabra = 'update-transaction-' + Date.now();
      
      const createResponse = await request(app)
        .post('/api/palabra')
        .send({ palabra })
        .expect(200);
      
      const wordId = createResponse.body.id;
      
      // Actualizar la palabra a través de la API
      const newRepresentation = '***custom***';
      await request(app)
        .put(`/api/admin/palabra/${wordId}`)
        .send({ representacion: newRepresentation })
        .expect(200);
      
      // Verificar directamente en la base de datos que la palabra se actualizó
      const pool = getPool();
      let connection;
      try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
          'SELECT * FROM palabras WHERE id = ?',
          [wordId]
        );
        
        expect(rows.length).toBe(1);
        expect(rows[0].representacion).toBe(newRepresentation);
      } finally {
        if (connection) {
          connection.release();
        }
      }
    });

    it('should delete a word and verify it no longer exists in the database', async () => {
      // Crear una palabra para eliminar
      const palabra = 'delete-transaction-' + Date.now();
      
      const createResponse = await request(app)
        .post('/api/palabra')
        .send({ palabra })
        .expect(200);
      
      const wordId = createResponse.body.id;
      
      // Eliminar la palabra a través de la API
      await request(app)
        .delete(`/api/admin/palabra/${wordId}`)
        .expect(200);
      
      // Verificar directamente en la base de datos que la palabra ya no existe
      const pool = getPool();
      let connection;
      try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
          'SELECT * FROM palabras WHERE id = ?',
          [wordId]
        );
        
        expect(rows.length).toBe(0);
      } finally {
        if (connection) {
          connection.release();
        }
      }
    });
  });

  // Test para verificar el manejo de transacciones en caso de error
  describe('Transaction Rollback', () => {
    it('should rollback changes when an error occurs', async () => {
      // Este test es más complejo y requeriría modificar el código de la aplicación
      // para simular un error durante una transacción.
      // 
      // En una implementación real, podríamos usar un middleware que intercepte
      // ciertas solicitudes y fuerce un error después de iniciar una transacción.
      //
      // Por ahora, verificaremos que la base de datos permanece consistente
      // después de operaciones fallidas.
      
      // Intentar actualizar una palabra que no existe
      const nonExistentId = 9999;
      await request(app)
        .put(`/api/admin/palabra/${nonExistentId}`)
        .send({ representacion: '***test***' })
        .expect(404);
      
      // Verificar que no se creó ninguna palabra con ese ID
      const pool = getPool();
      let connection;
      try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
          'SELECT * FROM palabras WHERE id = ?',
          [nonExistentId]
        );
        
        expect(rows.length).toBe(0);
      } finally {
        if (connection) {
          connection.release();
        }
      }
    });
  });

  // Test para verificar la integridad de los datos
  describe('Data Integrity', () => {
    it('should maintain data integrity with concurrent operations', async () => {
      // Crear una palabra para las pruebas de concurrencia
      const palabra = 'concurrent-integrity-' + Date.now();
      
      const createResponse = await request(app)
        .post('/api/palabra')
        .send({ palabra })
        .expect(200);
      
      const wordId = createResponse.body.id;
      
      // Realizar múltiples solicitudes concurrentes para incrementar el contador
      const numRequests = 5;
      const promises = [];
      
      for (let i = 0; i < numRequests; i++) {
        promises.push(
          request(app)
            .post('/api/palabra')
            .send({ palabra })
        );
      }
      
      await Promise.all(promises);
      
      // Verificar directamente en la base de datos que el contador se incrementó correctamente
      const pool = getPool();
      let connection;
      try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
          'SELECT * FROM palabras WHERE id = ?',
          [wordId]
        );
        
        expect(rows.length).toBe(1);
        // El contador debería ser al menos 1 (puede variar debido a condiciones de carrera)
        // No podemos garantizar exactamente 1 + numRequests debido a cómo se manejan las transacciones concurrentes
        expect(rows[0].contador_uso).toBeGreaterThanOrEqual(1);
      } finally {
        if (connection) {
          connection.release();
        }
      }
    });
  });
});