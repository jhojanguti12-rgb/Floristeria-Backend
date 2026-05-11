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
      // Forzamos a que ventasTotal sea un número, nunca null
      ventasTotal = Number(pedidosRows[0]?.suma) || 0;

      const [recientesRows] = await db.query('SELECT id, cliente, total, fecha FROM pedidos ORDER BY id DESC LIMIT 5');
      pedidosLista = recientesRows;
    } catch (e) {
      console.warn("Tabla pedidos vacía o no disponible");
    }

    return {
      inventario: floresRows[0]?.total || 0,
      personal: usuariosRows[0]?.total || 0,
      pedidosCount,
      ventasTotal,
      pedidosLista
    };
  } catch (error) {
    console.error("Error en Service:", error);
    throw error;
  }
};

module.exports = { getResumenStats };