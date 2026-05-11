const db = require('../config/db');

const getResumenStats = async () => {
  try {
    // 1. Contamos las flores
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const totalFlores = floresRows[0]?.total || 0;

    // 2. Contamos los usuarios
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsuarios = usuariosRows[0]?.total || 0;

    // 3. Bloque seguro para pedidos
    let pedidosCount = 0;
    let ventasTotal = 0;
    let pedidosLista = []; // Inicializamos como array vacío

    try {
      const [pedidosRows] = await db.query('SELECT COUNT(*) as total FROM pedidos');
      const [ventasRows] = await db.query('SELECT SUM(total) as totalVentas FROM pedidos');
      
      // Traemos los últimos 4 pedidos
      const [recientesRows] = await db.query('SELECT id, cliente, total, fecha FROM pedidos ORDER BY fecha DESC LIMIT 4');
      
      pedidosCount = pedidosRows[0]?.total || 0;
      ventasTotal = ventasRows[0]?.totalVentas || 0;
      pedidosLista = recientesRows; // <-- Aquí se llena con los datos de la DB
    } catch (e) {
      console.warn("Aviso: Tabla pedidos no disponible o vacía.", e.message);
    }

    return {
      inventario: totalFlores,
      personal: totalUsuarios,
      pedidosCount: pedidosCount,
      ventasTotal: ventasTotal,
      pedidosLista: pedidosLista // <-- CAMBIO AQUÍ: Enviamos la variable, NO un [] vacío
    };
    
  } catch (error) {
    console.error("❌ ERROR EN STATSSERVICE:", error.message);
    throw error;
  }
};

module.exports = { getResumenStats };