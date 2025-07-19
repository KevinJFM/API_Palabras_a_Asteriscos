const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const app = express();

// Middlewares
app.use(express.json()); // Para leer JSON

// Rutas
const wordsRoutes = require('./routes/palabras');
app.use('/api', wordsRoutes);

// Middleware de manejo de errores (debe ir después de las rutas)
app.use(errorHandler);

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
