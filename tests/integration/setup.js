// tests/integration/setup.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool para conexiones de prueba
let pool = null;

// Create a separate test database connection
const createTestDbConnection = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'fantasma',
    multipleStatements: true // Allow multiple statements for setup/teardown
  });
  
  return connection;
};

// Setup test database
const setupTestDb = async () => {
  const connection = await createTestDbConnection();
  
  try {
    // Create test database if it doesn't exist
    await connection.query(`
      DROP DATABASE IF EXISTS palabras_test;
      CREATE DATABASE palabras_test;
      USE palabras_test;
      
      CREATE TABLE palabras (
        id INT AUTO_INCREMENT PRIMARY KEY,
        palabra VARCHAR(255) NOT NULL,
        representacion TEXT NOT NULL,
        contador_uso INT DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        ultima_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (palabra)
      );
      
      -- Insert some test data
      INSERT INTO palabras (palabra, representacion, contador_uso) VALUES
      ('test', '*e**', 1),
      ('hello', '*e**o', 5),
      ('world', '*o***', 3);
    `);
    
    console.log('Test database setup complete');
    
    // Crear un pool para las pruebas
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'fantasma',
      database: 'palabras_test',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

// Teardown test database
const teardownTestDb = async () => {
  try {
    // Cerrar el pool si existe
    if (pool) {
      await pool.end();
      pool = null;
      console.log('Database pool closed successfully');
    }
    
    const connection = await createTestDbConnection();
    
    try {
      // Drop test database
      await connection.query('DROP DATABASE IF EXISTS palabras_test;');
      console.log('Test database teardown complete');
    } catch (error) {
      console.error('Error tearing down test database:', error);
      throw error;
    } finally {
      await connection.end();
      console.log('Database connection closed successfully');
    }
  } catch (err) {
    console.error('Error in teardownTestDb:', err);
  }
};

// Obtener una conexión del pool
const getConnection = async () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call setupTestDb first.');
  }
  return pool.getConnection();
};

module.exports = {
  setupTestDb,
  teardownTestDb,
  getConnection,
  getPool: () => pool
};