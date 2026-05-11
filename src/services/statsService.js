const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    
    let pedidosCount = 0;
    let ventasTotal = 0;
    let pedidosLista = [];

    try {
      const [pedidosRows] = await db.query('SELECT COUNT(*) as total, SUM(total) as suma FROM pedidos');
      pedidosCount = pedidosRows[0]?.total || 0;
      ventasTotal = Number(pedidosRows[0]?.suma) || 0;

      // Solo traemos los datos, sin mapeos complejos que puedan fallar
      const [recientesRows] = await db.query('SELECT id, cliente, total, fecha FROM pedidos ORDER BY id DESC LIMIT 5');
      pedidosLista = recientesRows; 
    } catch (e) {
      console.warn("Error en tabla pedidos:", e.message);
    }

    return {
      inventario: floresRows[0]?.total || 0,
      personal: usuariosRows[0]?.total || 0,
      pedidosCount: Number(pedidosCount),
      ventasTotal: Number(ventasTotal),
      pedidosLista: Array.isArray(pedidosLista) ? pedidosLista : []
    };
  } catch (error) {
    console.error("Error en Service:", error);
    return { inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] };
  }
};

module.exports = { getResumenStats };