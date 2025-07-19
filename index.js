const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { initializeDatabase } = require('./src/config/initDb');
require('dotenv').config();

// Puerto donde correrá el servidor
const PORT = process.env.PORT || 3000;

// Inicializar la base de datos y luego iniciar el servidor
async function startServer() {
  try {
    // Probar la conexión a la base de datos
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('No se pudo conectar a la base de datos. Verifique su configuración.');
      process.exit(1);
    }
    
    // Inicializar la base de datos (crear tablas si no existen)
    await initializeDatabase();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor inicializado en el puerto: ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();


// Instala nodemon para que se reinicie solo cada vez que guardas:
// npm install -D nodemon

// Esto en package.json, agrega esto en los scripts:
// "scripts": {
//   "dev": "nodemon index.js"
// }

// Para correrlo
// npm run dev