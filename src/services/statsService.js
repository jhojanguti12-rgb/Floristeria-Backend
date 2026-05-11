const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const [pedidosRows] = await db.query('SELECT COUNT(*) as total, SUM(total) as suma FROM pedidos');

    let pedidosLista = [];
    try {
      const [rows] = await db.query(`
        SELECT 
          p.id, 
          COALESCE(c.nombre, 'Cliente Registrado') as nombre_cliente, 
          p.total,
          COALESCE(p.estado, 'pendiente') as estado_pedido
        FROM pedidos p
        LEFT JOIN clientes c ON p.id_cliente = c.id
        ORDER BY p.id DESC LIMIT 5
      `);

      pedidosLista = rows.map(p => ({
        id: String(p.id),
        // IMPORTANTE: Probamos con 'cliente' y 'nombre' por si el frontend usa uno u otro
        cliente: String(p.nombre_cliente),
        nombre: String(p.nombre_cliente), 
        total: Number(p.total).toFixed(2),
        status: String(p.estado_pedido).toLowerCase(),
        fecha: "Hoy" // Dejamos "Hoy" o un texto simple para no arriesgar la pantalla blanca
      }));
    } catch (e) {
      console.log("Error detallado en lista:", e.message);
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