const mysql = require('mysql2/promise');
require('dotenv').config();

// 2. Creamos el pool con la configuración necesaria para Aiven
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1018239786j',
    // CAMBIO: Ajustado a 'defaultdb' que es lo que vimos en tu MySQL Workbench
    database: process.env.DB_NAME || 'defaultdb', 
    // CAMBIO: El puerto por defecto de Aiven suele ser 20140, asegúrate de tenerlo en tu .env
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
        // Un pequeño log extra para saber a qué DB nos conectamos exactamente
        console.log(`🌸 Conectado a MySQL en Aiven | DB: ${process.env.DB_NAME || 'defaultdb'}`);
        connection.release();
    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
        console.error('💡 Tip: Revisa que la IP de Render esté permitida o usa 0.0.0.0/0 en Aiven');
    }
})();

module.exports = pool;