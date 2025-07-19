/**
 * Middleware para validar la entrada de datos
 */

/**
 * Valida que el cuerpo de la petición contenga una palabra
 */
const validarPalabra = (req, res, next) => {
  const { palabra } = req.body;
  
  if (!palabra) {
    return res.status(400).json({ error: 'Se requiere una palabra' });
  }
  
  if (typeof palabra !== 'string') {
    return res.status(400).json({ error: 'La palabra debe ser una cadena de texto' });
  }
  
  if (palabra.trim().length === 0) {
    return res.status(400).json({ error: 'La palabra no puede estar vacía' });
  }
  
  // Si todo está bien, continuar
  next();
};

/**
 * Valida que el parámetro ID sea un número válido
 */
const validarId = (req, res, next) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ error: 'Se requiere un ID' });
  }
  
  const idNumerico = parseInt(id);
  
  if (isNaN(idNumerico) || idNumerico <= 0) {
    return res.status(400).json({ error: 'El ID debe ser un número positivo' });
  }
  
  // Si todo está bien, continuar
  next();
};

/**
 * Valida los parámetros de paginación
 */
const validarPaginacion = (req, res, next) => {
  let { pagina, limite } = req.query;
  
  // Valores por defecto
  pagina = pagina || '1';
  limite = limite || '10';
  
  // Convertir a números
  const paginaNum = parseInt(pagina);
  const limiteNum = parseInt(limite);
  
  // Validar
  if (isNaN(paginaNum) || paginaNum <= 0) {
    return res.status(400).json({ error: 'La página debe ser un número positivo' });
  }
  
  if (isNaN(limiteNum) || limiteNum <= 0 || limiteNum > 100) {
    return res.status(400).json({ error: 'El límite debe ser un número entre 1 y 100' });
  }
  
  // Asignar los valores validados
  req.query.pagina = paginaNum;
  req.query.limite = limiteNum;
  
  // Si todo está bien, continuar
  next();
};

/**
 * Valida los datos para actualizar una palabra
 */
const validarActualizacion = (req, res, next) => {
  const { palabra, representacion } = req.body;
  
  // Debe haber al menos un campo para actualizar
  if (!palabra && !representacion) {
    return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar' });
  }
  
  // Validar palabra si existe
  if (palabra !== undefined) {
    if (typeof palabra !== 'string' || palabra.trim().length === 0) {
      return res.status(400).json({ error: 'La palabra debe ser una cadena de texto no vacía' });
    }
  }
  
  // Validar representación si existe
  if (representacion !== undefined) {
    if (typeof representacion !== 'string' || representacion.trim().length === 0) {
      return res.status(400).json({ error: 'La representación debe ser una cadena de texto no vacía' });
    }
  }
  
  // Si todo está bien, continuar
  next();
};

module.exports = {
  validarPalabra,
  validarId,
  validarPaginacion,
  validarActualizacion
};