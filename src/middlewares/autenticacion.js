/**
 * Middleware para verificar autenticación de administrador
 * @param {Request} req - Objeto de solicitud
 * @param {Response} res - Objeto de respuesta
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const verificarAdmin = (req, res, next) => {
  // En un caso real, aquí verificarías tokens, cookies, etc.
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey === process.env.ADMIN_API_KEY || apiKey === 'admin-secret-key') {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
};

module.exports = {
  verificarAdmin
};