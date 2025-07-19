// tests/integration/test-env.js
// Override environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'palabras_test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'fantasma';

// Mock database module for tests
jest.mock('../../src/config/database', () => {
  // We'll use a dynamic import to get the actual pool from our test setup
  const getTestPool = () => {
    try {
      const setup = require('./setup');
      return setup.getPool();
    } catch (error) {
      console.error('Error getting test pool:', error);
      return null;
    }
  };

  return {
    pool: {
      query: (...args) => {
        const pool = getTestPool();
        if (pool) {
          return pool.query(...args);
        }
        throw new Error('Test pool not initialized');
      },
      getConnection: () => {
        const pool = getTestPool();
        if (pool) {
          return pool.getConnection();
        }
        throw new Error('Test pool not initialized');
      },
      end: async () => {
        const pool = getTestPool();
        if (pool) {
          return pool.end();
        }
        return Promise.resolve();
      }
    },
    testConnection: async () => true
  };
});

// Mock authentication middleware for admin routes
jest.mock('../../src/middlewares/autenticacion', () => ({
  verificarAdmin: (req, res, next) => {
    // For testing, we'll bypass authentication
    next();
  }
}));