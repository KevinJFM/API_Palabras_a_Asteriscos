/**
 * Middleware para manejar errores de forma centralizada
 * @param {Error} err - Error capturado
 * @param {Request} req - Objeto de solicitud
 * @param {Response} res - Objeto de respuesta
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const errorHandler = (err, req, res, next) => {
  // Registrar el error
  console.error('Error capturado por el middleware:', err);
  
  // Determinar el código de estado
  const statusCode = err.statusCode || 500;
  
  // Preparar el mensaje de error
  const errorResponse = {
    error: err.message || 'Error interno del servidor',
  };
  
  // En desarrollo, incluir la pila de llamadas
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  // Enviar respuesta de error
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;