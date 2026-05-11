const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    
    let pedidosCount = 0;
    let ventasTotal = 0;
    let pedidosLista = [];

    try {
      // 1. Totales
      const [pedidosRows] = await db.query('SELECT COUNT(*) as total, SUM(total) as suma FROM pedidos');
      pedidosCount = pedidosRows[0]?.total || 0;
      ventasTotal = Number(pedidosRows[0]?.suma) || 0;

      // 2. Consulta con JOIN para traer el nombre del cliente
      // Usamos LEFT JOIN por si un pedido no tiene cliente asignado que no rompa la consulta
      const [recientesRows] = await db.query(`
        SELECT 
          p.id, 
          c.nombre AS cliente, 
          p.total, 
          p.fecha_pedido AS fecha 
        FROM pedidos p
        LEFT JOIN clientes c ON p.id_cliente = c.id
        ORDER BY p.id DESC 
        LIMIT 5
      `);

      pedidosLista = recientesRows;

    } catch (e) {
      console.warn("Error consultando pedidos con JOIN:", e.message);
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