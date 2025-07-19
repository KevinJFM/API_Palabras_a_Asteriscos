const { pool } = require('../config/database');

/**
 * Repositorio base con funciones comunes para operaciones CRUD
 */
class BaseRepository {
  /**
   * Constructor del repositorio base
   * @param {string} tableName - Nombre de la tabla
   */
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Ejecuta una consulta SQL con parámetros
   * @param {string} sql - Consulta SQL
   * @param {Array} params - Parámetros para la consulta
   * @returns {Promise} - Resultado de la consulta
   */
  async query(sql, params = []) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (error) {
      console.error(`Error en consulta SQL: ${sql}`, error);
      throw new Error(`Error en la base de datos: ${error.message}`);
    }
  }

  /**
   * Encuentra un registro por su ID
   * @param {number} id - ID del registro
   * @returns {Promise} - Registro encontrado o null
   */
  async findById(id) {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const results = await this.query(sql, [id]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error al buscar por ID en ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra todos los registros con paginación opcional
   * @param {number} page - Número de página (comienza en 1)
   * @param {number} limit - Límite de registros por página
   * @returns {Promise} - Registros encontrados
   */
  async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const sql = `SELECT * FROM ${this.tableName} LIMIT ? OFFSET ?`;
      return await this.query(sql, [limit, offset]);
    } catch (error) {
      console.error(`Error al buscar todos los registros en ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo registro
   * @param {Object} data - Datos del registro
   * @returns {Promise} - Resultado de la inserción
   */
  async create(data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      
      const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = await this.query(sql, values);
      
      return {
        id: result.insertId,
        ...data
      };
    } catch (error) {
      console.error(`Error al crear registro en ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza un registro existente
   * @param {number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} - Resultado de la actualización
   */
  async update(id, data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
      
      const result = await this.query(sql, [...values, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error al actualizar registro en ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un registro
   * @param {number} id - ID del registro
   * @returns {Promise} - Resultado de la eliminación
   */
  async delete(id) {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const result = await this.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error al eliminar registro en ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Cuenta el número total de registros
   * @returns {Promise<number>} - Número total de registros
   */
  async count() {
    try {
      const sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      const result = await this.query(sql);
      return result[0].total;
    } catch (error) {
      console.error(`Error al contar registros en ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Busca registros que coincidan con ciertos criterios
   * @param {Object} criteria - Criterios de búsqueda (campo: valor)
   * @returns {Promise} - Registros encontrados
   */
  async findByCriteria(criteria) {
    try {
      const keys = Object.keys(criteria);
      const values = Object.values(criteria);
      
      const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
      const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
      
      return await this.query(sql, values);
    } catch (error) {
      console.error(`Error al buscar por criterios en ${this.tableName}:`, error);
      throw error;
    }
  }
}

module.exports = BaseRepository;