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
    try {
      const [pedidosRows] = await db.query('SELECT COUNT(*) as total FROM pedidos');
      const [ventasRows] = await db.query('SELECT SUM(total) as totalVentas FROM pedidos');
      pedidosCount = pedidosRows[0]?.total || 0;
      ventasTotal = ventasRows[0]?.totalVentas || 0;
    } catch (e) {
      console.warn("Aviso: Tabla pedidos no disponible.");
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