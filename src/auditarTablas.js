const { performance } = require('perf_hooks');
const readline = require('readline');
const mysql = require('mysql2/promise');

console.log(`\n🌐 CONFIGURANDO SISTEMA DE AUDITORÍA INTEGRAL DE PRODUCCIÓN (AIVEN)...`);

const pool = mysql.createPool({
    host: 'mysql-ffa6671-floristeria-2026.c.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_cfLC7uEqiDn-bvF6Sro',
    database: 'defaultdb',
    port: 20140,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    namedPlaceholders: true,
    ssl: {
        rejectUnauthorized: false
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// --- [RF-02 y RF-03]: Conteo de Registros y Medición de Latencia ---
const checkTableStats = async (tableName) => {
    console.log(`\n==================================================`);
    console.log(`⏳ Analizando rendimiento en la tabla '${tableName}'...`);
    console.log(`==================================================`);

    try {
        const startTime = performance.now();
        const query = `SELECT COUNT(*) AS total FROM ${tableName}`;
        const [resultado] = await pool.execute(query);
        const endTime = performance.now();
        
        const totalRecords = resultado[0]?.total !== undefined ? resultado[0].total : 0;
        const latency = endTime - startTime;

        console.log(`\n📊  RESULTADOS EN VIVO (AIVEN):`);
        console.log(`📈  Total de registros reales (RF-02): ${Number(totalRecords).toLocaleString('es-CO')}`);
        console.log(`⚡  Tiempo de respuesta / Latencia (RF-03): ${latency.toFixed(2)} ms`);

    } catch (error) {
        console.error(`\n❌ Error en la consulta de '${tableName}':`, error.message);
    } finally {
        volverAlMenu();
    }
};

// --- [RF-04]: Validación de Stock y Alertas de Negocio ---
const ejecutarValidacionesStock = async () => {
    console.log(`\n==================================================`);
    console.log(`🕵️‍♂️  EJECUTANDO RF-04: VALIDACIONES DE STOCK Y CONTROL DE ERRORES`);
    console.log(`==================================================`);

    try {
        // 1. Alertas de Stock Bajo (Menos de 20 unidades)
        console.log(`\n🔍 1. Buscando flores con Alerta de Stock Crítico (Menos de 20 unidades)...`);
        const [stockBajo] = await pool.execute(`SELECT nombre, stock FROM flores WHERE stock < 20`);
        
        if (stockBajo.length > 0) {
            console.log(`⚠️  ALERTAS DE REABASTECIMIENTO DETECTADAS:`);
            stockBajo.forEach(flor => {
                console.log(`   • [ALERTA] La flor '${flor.nombre}' tiene solo ${flor.stock} unidades en inventario.`);
            });
        } else {
            console.log(`✅ Todo bien: Todas las flores cuentan con stock suficiente en inventario.`);
        }

        // 2. Validación de consistencia de Precios ($0 o negativos)
        console.log(`\n🔍 2. Validando consistencia de precios (Buscando errores en valores)...`);
        const [preciosError] = await pool.execute(`SELECT nombre, precio FROM flores WHERE precio <= 0`);
        
        if (preciosError.length > 0) {
            console.log(`🚨  ERRORES CRÍTICOS DE NEGOCIO ENCONTRADOS:`);
            preciosError.forEach(flor => {
                console.log(`   • [ERROR] '${flor.nombre}' se encuentra registrado con precio inválido: $${flor.precio}`);
            });
        } else {
            console.log(`✅ Todo bien: No se detectaron productos con precio en $0 o valores negativos.`);
        }

    } catch (error) {
        console.error(`\n❌ Error ejecutando las validaciones del RF-04:`, error.message);
    } finally {
        volverAlMenu();
    }
};

const volverAlMenu = () => {
    console.log(`==================================================`);
    console.log(`Presiona ENTER para volver al menú o Ctrl+C para salir.`);
    console.log(`==================================================`);
    rl.once('line', () => mostrarMenu());
};

const mostrarMenu = () => {
    console.clear();
    console.log("==================================================");
    console.log("   🕵️‍♂️  SISTEMA DE AUDITORÍA CONSOLIDA - FLORISTERÍA");
    console.log("==================================================");
    console.log("Selecciona un requerimiento para evaluar:");
    console.log("1. [RF-02 y RF-03] Auditar Tabla Flores (Conteo + Latencia)");
    console.log("2. [RF-04] Ejecutar Validaciones de Stock y Precios");
    console.log("3. Salir del programa");
    console.log("==================================================");
    
    rl.question('Selecciona una opción (1-3): ', (opcion) => {
        switch (opcion.trim()) {
            case '1':
                checkTableStats('flores');
                break;
            case '2':
                ejecutarValidacionesStock();
                break;
            case '3':
                console.log("\n🚪 Cerrando auditoría. ¡Éxitos en el examen!");
                rl.close();
                process.exit(0);
            default:
                console.log('❌ Opción inválida.');
                setTimeout(() => mostrarMenu(), 1500);
        }
    });
};

mostrarMenu();