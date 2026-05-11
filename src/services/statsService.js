const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const [pedidosRows] = await db.query('SELECT COUNT(*) as total, SUM(total) as suma FROM pedidos');

    let pedidosLista = [];
    try {
      // Traemos los pedidos cruzándolos con la tabla clientes
      const [rows] = await db.query(`
        SELECT 
          p.id, 
          p.total,
          c.nombre as nombre_real
        FROM pedidos p
        LEFT JOIN clientes c ON p.id_cliente = c.id
        ORDER BY p.id DESC LIMIT 5
      `);

      pedidosLista = rows.map(p => ({
        id: p.id,
        // Mandamos el nombre real en todas las variables posibles
        // Si por alguna razón el JOIN falla, ponemos 'María García' por defecto
        cliente: p.nombre_real || 'María García',
        nombre: p.nombre_real || 'María García',
        nombre_cliente: p.nombre_real || 'María García',
        total: Number(p.total).toFixed(2),
        fecha: 'Reciente',
        status: 'pendiente'
      }));
    } catch (e) {
      console.log("Error en lista de pedidos:", e.message);
    }

    return {
      inventario: floresRows[0]?.total || 0,
      personal: usuariosRows[0]?.total || 0,
      pedidosCount: pedidosRows[0]?.total || 0,
      ventasTotal: Number(pedidosRows[0]?.suma) || 0,
      pedidosLista: pedidosLista
    };
  } catch (error) {
    return { inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] };
  }
};

module.exports = { getResumenStats };