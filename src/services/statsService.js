const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [flores] = await db.query('SELECT COUNT(*) as t FROM flores');
    const [usuarios] = await db.query('SELECT COUNT(*) as t FROM usuarios');
    const [pedidosT] = await db.query('SELECT COUNT(*) as t, SUM(total) as s FROM pedidos');
    
    // Traemos los pedidos directamente aquí
    const [filas] = await db.query(`
      SELECT p.id, p.total, c.nombre 
      FROM pedidos p 
      LEFT JOIN clientes c ON p.id_cliente = c.id 
      ORDER BY p.id DESC LIMIT 5
    `);

    const pedidosLista = filas.map(p => ({
      id: String(p.id),
      cliente: p.nombre || "Maria Garcia", // Forzamos el nombre aquí
      nombre: p.nombre || "Maria Garcia",
      total: Number(p.total || 0).toFixed(2),
      status: "completado", // Cambiamos esto a ver si el color cambia en el Dashboard
      fecha: "Reciente"
    }));

    return {
      inventario: flores[0]?.t || 0,
      personal: usuarios[0]?.t || 0,
      pedidosCount: pedidosT[0]?.t || 0,
      ventasTotal: Number(pedidosT[0]?.s || 0),
      pedidosLista: pedidosLista,
      // Duplicamos la lista con otros nombres por si el frontend busca estos:
      recentOrders: pedidosLista,
      ultimosPedidos: pedidosLista
    };
  } catch (error) {
    return { inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] };
  }
};

module.exports = { getResumenStats };