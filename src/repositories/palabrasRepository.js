const BaseRepository = require('./baseRepository');

/**
 * Repositorio para manejar operaciones relacionadas con palabras
 */
class PalabrasRepository extends BaseRepository {
  /**
   * Constructor del repositorio de palabras
   */
  constructor() {
    super('palabras');
  }

  /**
   * Guarda una palabra y su representación en asteriscos
   * Si la palabra ya existe, actualiza su contador y fecha de última consulta
   * @param {string} palabra - La palabra a guardar
   * @param {string} representacion - La representación en asteriscos
   * @returns {Promise<Object>} - La palabra guardada con su ID
   */
  async guardarPalabra(palabra, representacion) {
    try {
      // Verificar si la palabra ya existe
      const palabraExistente = await this.buscarPorPalabra(palabra);
      
      if (palabraExistente) {
        // Si existe, actualizar contador y fecha
        const contador = palabraExistente.contador_uso + 1;
        await this.update(palabraExistente.id, {
          contador_uso: contador,
          ultima_consulta: new Date()
        });
        
        return {
          ...palabraExistente,
          contador_uso: contador,
          ultima_consulta: new Date()
        };
      } else {
        // Si no existe, crear nueva entrada
        return await this.create({
          palabra,
          representacion,
          contador_uso: 1,
          fecha_creacion: new Date(),
          ultima_consulta: new Date()
        });
      }
    } catch (error) {
      console.error('Error al guardar palabra:', error);
      throw error;
    }
  }

  /**
   * Busca una palabra por su texto exacto
   * @param {string} palabra - La palabra a buscar
   * @returns {Promise<Object|null>} - La palabra encontrada o null
   */
  async buscarPorPalabra(palabra) {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE palabra = ?`;
      const results = await this.query(sql, [palabra]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error al buscar palabra:', error);
      throw error;
    }
  }

  /**
   * Incrementa el contador de uso de una palabra
   * @param {number} id - ID de la palabra
   * @returns {Promise<boolean>} - True si se actualizó correctamente
   */
  async incrementarContador(id) {
    try {
      const palabra = await this.findById(id);
      if (!palabra) return false;
      
      const contador = palabra.contador_uso + 1;
      return await this.update(id, {
        contador_uso: contador,
        ultima_consulta: new Date()
      });
    } catch (error) {
      console.error('Error al incrementar contador:', error);
      throw error;
    }
  }

  /**
   * Busca palabras que contengan un texto específico
   * @param {string} texto - Texto a buscar
   * @param {number} page - Número de página
   * @param {number} limit - Límite de resultados por página
   * @returns {Promise<Array>} - Palabras encontradas
   */
  async buscarPorTexto(texto, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const sql = `SELECT * FROM ${this.tableName} WHERE palabra LIKE ? LIMIT ? OFFSET ?`;
      return await this.query(sql, [`%${texto}%`, limit, offset]);
    } catch (error) {
      console.error('Error al buscar por texto:', error);
      throw error;
    }
  }

  /**
   * Obtiene las palabras más utilizadas
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} - Palabras más utilizadas
   */
  async obtenerMasUtilizadas(limit = 10) {
    try {
      const sql = `SELECT * FROM ${this.tableName} ORDER BY contador_uso DESC LIMIT ?`;
      return await this.query(sql, [limit]);
    } catch (error) {
      console.error('Error al obtener palabras más utilizadas:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de uso
   * @returns {Promise<Object>} - Estadísticas de uso
   */
  async obtenerEstadisticas() {
    try {
      const totalPalabras = await this.count();
      const masUtilizadas = await this.obtenerMasUtilizadas(5);
      
      const sqlUsoTotal = `SELECT SUM(contador_uso) as total_usos FROM ${this.tableName}`;
      const resultUsoTotal = await this.query(sqlUsoTotal);
      const totalUsos = resultUsoTotal[0].total_usos || 0;
      
      const sqlUltimas = `SELECT * FROM ${this.tableName} ORDER BY ultima_consulta DESC LIMIT 5`;
      const ultimasConsultadas = await this.query(sqlUltimas);
      
      return {
        total_palabras: totalPalabras,
        total_usos: totalUsos,
        palabras_mas_utilizadas: masUtilizadas,
        ultimas_consultadas: ultimasConsultadas
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

module.exports = new PalabrasRepository();