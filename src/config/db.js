
const mysql = require('mysql2/promise');
require('dotenv').config();

// 2. Creamos el pool con la configuración necesaria para Aiven
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1018239786j',
    database: process.env.DB_NAME || 'floristeria_db',
    // IMPORTANTE: Aiven usa el puerto 20140 (o similar), no el 3306
    port: process.env.DB_PORT || 3306, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
    // 👇 ESTO ES LO QUE SOLUCIONA EL ETIMEDOUT EN AIVEN 👇
    ssl: {
        rejectUnauthorized: false
    }
});

// 3. Verificación de conexión
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('🌸 Conectado a la base de datos MySQL en Aiven (SSL Activo)');
        connection.release();
    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
        console.error('💡 Tip: Revisa que la IP 0.0.0.0/0 esté permitida en Aiven');
    }
})();

module.exports = pool;