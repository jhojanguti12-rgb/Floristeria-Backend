const app = require('./app'); // Importa la configuración de app.js
const db = require('./config/db'); // Importa la conexión a la base de datos

const PORT = process.env.PORT || 4000;

// Función para arrancar el servidor
const startServer = async () => {
    try {
        // Probamos la conexión a la base de datos antes de subir el server
        await db.query('SELECT 1');
        console.log('🌸 Conectado a la base de datos MySQL de forma segura');

        // Modificado para Render: añadimos '0.0.0.0' para que escuche peticiones externas
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor Express encendido y listo en el puerto: ${PORT}`);
        });
    } catch (error) {
        console.error('❌ No se pudo iniciar el servidor:', error.message);
        console.log('Reintentando conexión a la base de datos en 5 segundos...');
        
        // En lugar de matar el proceso, reintenta en 5 segundos. 
        // Esto evita que Render marque tu servidor como "caído" por un retraso temporal de la DB.
        setTimeout(startServer, 5000);
    }
};

startServer();