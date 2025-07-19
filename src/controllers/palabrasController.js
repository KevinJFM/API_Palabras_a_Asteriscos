const palabrasService = require('../services/palabrasService');

/**
 * Procesa una palabra y devuelve su representación en asteriscos
 * También guarda la palabra en la base de datos
 */
const PalabraEnAsteriscos = async (req, res) => {
  try {
    const { palabra } = req.body;

    if (!palabra) {
      return res.status(400).json({ error: 'Se requiere una palabra' });
    }

    // Usar el servicio para procesar la palabra y guardarla
    const resultado = await palabrasService.procesarPalabra(palabra);

    // Mostrar en consola
    console.log('\n' + resultado.representacion + '\n');

    // Devolver respuesta
    res.json({
      id: resultado.id,
      palabra: resultado.palabra,
      resultado: resultado.representacion,
      contador_uso: resultado.contador_uso
    });
  } catch (error) {
    console.error('Error al procesar palabra:', error);
    res.status(500).json({ error: 'Error al procesar la palabra' });
  }
};

/**
 * Obtiene una palabra por su ID
 */
const obtenerPalabra = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Se requiere un ID válido' });
    }
    
    const palabra = await palabrasService.obtenerPalabra(parseInt(id));
    
    // Mostrar en consola
    console.log('\n' + palabra.representacion + '\n');

    res.json(palabra);
  } catch (error) {
    console.error('Error al obtener palabra:', error);
    
    if (error.message.includes('No se encontró')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error al obtener la palabra' });
  }
};

/**
 * Lista todas las palabras con paginación
 */
const listarPalabras = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    
    const resultado = await palabrasService.listarPalabras(pagina, limite);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al listar palabras:', error);
    res.status(500).json({ error: 'Error al listar las palabras' });
  }
};

/**
 * Busca palabras por texto
 */
const buscarPalabras = async (req, res) => {
  try {
    const { texto } = req.query;
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    
    const resultado = await palabrasService.buscarPalabras(texto, pagina, limite);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al buscar palabras:', error);
    res.status(500).json({ error: 'Error al buscar palabras' });
  }
};

module.exports = { 
  PalabraEnAsteriscos,
  obtenerPalabra,
  listarPalabras,
  buscarPalabras
};