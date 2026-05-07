const app = require('./app'); // Importa la configuración de app.js
const db = require('./config/db'); // Importa la conexión a la base de datos

const PORT = process.env.PORT || 4000;

// Función para arrancar el servidor
const startServer = async () => {
    try {
        // Probamos la conexión a la base de datos antes de subir el server
        await db.query('SELECT 1');
        console.log('🌸 Conectado a la base de datos MySQL de forma segura');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor Express encendido en: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ No se pudo iniciar el servidor:', error.message);
        process.exit(1); // Cierra el proceso si no hay base de datos
    }
};

startServer();

 