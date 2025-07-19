const express = require('express');
const router = express.Router();
const { 
  PalabraEnAsteriscos, 
  obtenerPalabra, 
  listarPalabras, 
  buscarPalabras 
} = require('../controllers/palabrasController');
const { 
  eliminarPalabra, 
  actualizarPalabra, 
  obtenerEstadisticas 
} = require('../controllers/adminController');
const {
  validarPalabra,
  validarId,
  validarPaginacion,
  validarActualizacion
} = require('../middlewares/validacion');
const { verificarAdmin } = require('../middlewares/autenticacion');

// Rutas públicas
router.post('/palabra', validarPalabra, PalabraEnAsteriscos);
router.get('/palabra/:id', validarId, obtenerPalabra);
router.get('/palabras', validarPaginacion, listarPalabras);
router.get('/palabras/buscar', validarPaginacion, buscarPalabras);

// Rutas administrativas (protegidas)
router.delete('/admin/palabra/:id', verificarAdmin, validarId, eliminarPalabra);
router.put('/admin/palabra/:id', verificarAdmin, validarId, validarActualizacion, actualizarPalabra);
router.get('/admin/estadisticas', verificarAdmin, obtenerEstadisticas);

module.exports = router;
