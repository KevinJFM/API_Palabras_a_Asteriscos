const { pool } = require('./database');

/**
 * Inicializa la base de datos creando las tablas necesarias si no existen
 */
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Crear tabla de palabras si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS palabras (
        id INT AUTO_INCREMENT PRIMARY KEY,
        palabra VARCHAR(255) NOT NULL,
        representacion TEXT NOT NULL,
        contador_uso INT DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        ultima_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (palabra)
      )
    `);
    
    console.log('Base de datos inicializada correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error.message);
    throw error;
  }
}

module.exports = { initializeDatabase };