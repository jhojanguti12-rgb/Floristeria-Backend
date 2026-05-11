const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const [pedidosRows] = await db.query('SELECT COUNT(*) as total, SUM(total) as suma FROM pedidos');

    return {
      inventario: floresRows[0]?.total || 0,
      personal: usuariosRows[0]?.total || 0,
      pedidosCount: pedidosRows[0]?.total || 0,
      ventasTotal: Number(pedidosRows[0]?.suma) || 0,
      // PRUEBA: Mandamos la lista vacía para ver si la pantalla blanca se va
      pedidosLista: [] 
    };
  } catch (error) {
    return { inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] };
  }
};

module.exports = { getResumenStats };