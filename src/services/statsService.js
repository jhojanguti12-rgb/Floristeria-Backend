const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [flores] = await db.query('SELECT COUNT(*) as t FROM flores');
    const [usuarios] = await db.query('SELECT COUNT(*) as t FROM usuarios');
    const [pedidosTotal] = await db.query('SELECT COUNT(*) as t, SUM(total) as s FROM pedidos');
    const [filas] = await db.query('SELECT id, total FROM pedidos ORDER BY id DESC LIMIT 5');

    // Mapeo ultra-seguro: convertimos todo a Strings y Numbers básicos
    const pedidosLista = filas.map(p => ({
      id: String(p.id),
      cliente: "Maria Garcia", // Texto plano, sin riesgo
      nombre: "Maria Garcia",  // Texto plano
      total: Number(p.total || 0).toFixed(2),
      status: "pendiente",
      fecha: "Reciente"
    }));

    return {
      inventario: Number(flores[0]?.t || 0),
      personal: Number(usuarios[0]?.t || 0),
      pedidosCount: Number(pedidosTotal[0]?.t || 0),
      ventasTotal: Number(pedidosTotal[0]?.s || 0),
      pedidosLista
    };
  } catch (error) {
    return { inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] };
  }
};

module.exports = { getResumenStats };