const palabrasRepository = require('../repositories/palabrasRepository');
const alfabetoPalabras = require('../helpers/Alfabeto');

/**
 * Servicio para manejar la lógica de negocio relacionada con palabras
 */
class PalabrasService {
  /**
   * Procesa una palabra para convertirla en representación de asteriscos y la guarda
   * @param {string} palabra - La palabra a procesar
   * @returns {Promise<Object>} - Resultado con la palabra procesada y guardada
   */
  async procesarPalabra(palabra) {
    try {
      if (!palabra) {
        throw new Error('Se requiere una palabra');
      }

      // Convertir a mayúsculas y dividir en letras
      const letras = palabra.toUpperCase().split('');
      const lineas = [];

      // Máximo número de líneas por letra (asumimos 7 como promedio)
      const maxLineas = 7;

      // Inicializa el array de líneas vacías
      for (let i = 0; i < maxLineas; i++) {
        lineas[i] = '';
      }

      // Por cada letra, agregamos cada línea a su fila correspondiente
      letras.forEach(letra => {
        const arte = alfabetoPalabras[letra] || [""];

        for (let i = 0; i < maxLineas; i++) {
          lineas[i] += (arte[i] || '       ') + '  '; // si no hay línea, rellena con espacios
        }
      });

      // Unir las líneas en una representación completa
      const representacion = lineas.join('\n');

      // Guardar en la base de datos
      const resultado = await palabrasRepository.guardarPalabra(palabra, representacion);

      return {
        id: resultado.id,
        palabra: resultado.palabra,
        representacion: resultado.representacion,
        contador_uso: resultado.contador_uso,
        fecha_creacion: resultado.fecha_creacion,
        ultima_consulta: resultado.ultima_consulta
      };
    } catch (error) {
      console.error('Error en el servicio de palabras:', error);
      throw error;
    }
  }

  /**
   * Obtiene una palabra por su ID
   * @param {number} id - ID de la palabra
   * @returns {Promise<Object>} - La palabra encontrada
   */
  async obtenerPalabra(id) {
    try {
      const palabra = await palabrasRepository.findById(id);
      
      if (!palabra) {
        throw new Error(`No se encontró la palabra con ID ${id}`);
      }
      
      // Incrementar el contador de uso
      await palabrasRepository.incrementarContador(id);
      
      // Obtener la palabra actualizada
      return await palabrasRepository.findById(id);
    } catch (error) {
      console.error(`Error al obtener palabra con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Lista todas las palabras con paginación
   * @param {number} pagina - Número de página
   * @param {number} limite - Límite de resultados por página
   * @returns {Promise<Object>} - Resultado paginado
   */
  async listarPalabras(pagina = 1, limite = 10) {
    try {
      const palabras = await palabrasRepository.findAll(pagina, limite);
      const total = await palabrasRepository.count();
      
      return {
        palabras,
        paginacion: {
          pagina,
          limite,
          total,
          paginas: Math.ceil(total / limite)
        }
      };
    } catch (error) {
      console.error('Error al listar palabras:', error);
      throw error;
    }
  }

  /**
   * Busca palabras por texto
   * @param {string} texto - Texto a buscar
   * @param {number} pagina - Número de página
   * @param {number} limite - Límite de resultados por página
   * @returns {Promise<Object>} - Resultado de la búsqueda
   */
  async buscarPalabras(texto, pagina = 1, limite = 10) {
    try {
      if (!texto) {
        return await this.listarPalabras(pagina, limite);
      }
      
      const palabras = await palabrasRepository.buscarPorTexto(texto, pagina, limite);
      
      // Para obtener el total exacto necesitaríamos otra consulta
      // Esto es una simplificación
      const total = palabras.length < limite ? palabras.length : await palabrasRepository.count();
      
      return {
        palabras,
        paginacion: {
          pagina,
          limite,
          total,
          paginas: Math.ceil(total / limite)
        },
        filtro: texto
      };
    } catch (error) {
      console.error('Error al buscar palabras:', error);
      throw error;
    }
  }
}

module.exports = new PalabrasService();