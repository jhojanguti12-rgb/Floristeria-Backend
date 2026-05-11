const db = require('../config/db');

const getResumenStats = async () => {
  try {
    // 1. Contamos las flores (Tabla en español según tu MySQL Workbench)
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const totalFlores = floresRows[0]?.total || 0;

    // 2. Contamos los usuarios
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsuarios = usuariosRows[0]?.total || 0;

    // 3. Bloque seguro para pedidos (por si la tabla está vacía)
    let pedidosCount = 0;
    let ventasTotal = 0;
 // ... dentro de getResumenStats, en el bloque try de pedidos:

    try {
      const [pedidosRows] = await db.query('SELECT COUNT(*) as total FROM pedidos');
      const [ventasRows] = await db.query('SELECT SUM(total) as totalVentas FROM pedidos');
      
      // CAMBIO AQUÍ: Traemos los últimos 4 pedidos con nombre y total
      // Ajusta 'cliente' si tu columna se llama diferente (ej. 'nombre_usuario')
      const [recientesRows] = await db.query('SELECT id, cliente, total, fecha FROM pedidos ORDER BY fecha DESC LIMIT 4');
      
      pedidosCount = pedidosRows[0]?.total || 0;
      ventasTotal = ventasRows[0]?.totalVentas || 0;
      pedidosLista = recientesRows; // Guardamos la lista real
    } catch (e) {
      console.warn("Aviso: Tabla pedidos no disponible o vacía.");
    }

    return {
      inventario: totalFlores,
      personal: totalUsuarios,
      pedidosCount: pedidosCount,
      ventasTotal: ventasTotal,
      pedidosLista: []
    };
    
  } catch (error) {
    console.error("❌ ERROR EN STATSSERVICE:", error.message);
    throw error;
  }
};

module.exports = { getResumenStats };