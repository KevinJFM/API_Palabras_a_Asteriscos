const palabrasRepository = require('../repositories/palabrasRepository');

/**
 * Servicio para manejar operaciones administrativas
 */
class AdminService {
  /**
   * Elimina una palabra por su ID
   * @param {number} id - ID de la palabra a eliminar
   * @returns {Promise<boolean>} - True si se eliminó correctamente
   */
  async eliminarPalabra(id) {
    try {
      const resultado = await palabrasRepository.delete(id);
      
      if (!resultado) {
        throw new Error(`No se pudo eliminar la palabra con ID ${id}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error al eliminar palabra con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza una palabra existente
   * @param {number} id - ID de la palabra
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} - La palabra actualizada
   */
  async actualizarPalabra(id, datos) {
    try {
      // Verificar que la palabra existe
      const palabraExistente = await palabrasRepository.findById(id);
      
      if (!palabraExistente) {
        throw new Error(`No se encontró la palabra con ID ${id}`);
      }
      
      // Actualizar solo los campos permitidos
      const camposPermitidos = ['palabra', 'representacion'];
      const datosActualizar = {};
      
      for (const campo of camposPermitidos) {
        if (datos[campo] !== undefined) {
          datosActualizar[campo] = datos[campo];
        }
      }
      
      // Si se actualiza la palabra, actualizar también la fecha de última consulta
      datosActualizar.ultima_consulta = new Date();
      
      // Realizar la actualización
      const resultado = await palabrasRepository.update(id, datosActualizar);
      
      if (!resultado) {
        throw new Error(`No se pudo actualizar la palabra con ID ${id}`);
      }
      
      // Devolver la palabra actualizada
      return await palabrasRepository.findById(id);
    } catch (error) {
      console.error(`Error al actualizar palabra con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de uso
   * @returns {Promise<Object>} - Estadísticas de uso
   */
  async obtenerEstadisticas() {
    try {
      return await palabrasRepository.obtenerEstadisticas();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

module.exports = new AdminService();