const mysql = require('mysql2/promise'); // 1. Cambiamos a la versión nativa de promesas
require('dotenv').config();

// 2. Creamos el pool directamente con soporte de promesas
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1018239786j',
    database: process.env.DB_NAME || 'floristeria_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true 
});

// 3. Verificación de conexión (Elegante y rápida)
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('🌸 Conectado a la base de datos MySQL (Pool con Promesas)');
        connection.release();
    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
    }
})();

// 4. Exportamos el pool directamente
// Como usamos 'mysql2/promise' arriba, ya no hace falta poner .promise() aquí
module.exports = pool;