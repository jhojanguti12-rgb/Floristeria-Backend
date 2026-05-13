const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [flores] = await db.query('SELECT COUNT(*) as t FROM flores');
    const [usuarios] = await db.query('SELECT COUNT(*) as t FROM usuarios');
    const [pedidosTotal] = await db.query('SELECT COUNT(*) as t, SUM(total) as s FROM pedidos');
    
    // Obtenemos los pedidos y el nombre del cliente
    const [filas] = await db.query(`
      SELECT p.id, p.total, c.nombre 
      FROM pedidos p 
      LEFT JOIN clientes c ON p.id_cliente = c.id 
      ORDER BY p.id DESC LIMIT 5
    `);

    const pedidosLista = filas.map(p => {
      // Limpiamos el nombre: si no existe, Maria Garcia; si existe, lo convertimos a texto puro
      const nombreLimpio = p.nombre ? String(p.nombre).trim() : "Maria Garcia";
      
      return {
        id: String(p.id),
        cliente: nombreLimpio,
        nombre: nombreLimpio,
        total: Number(p.total || 0).toFixed(2),
        status: "pendiente",
        fecha: "13 de mayo"
      };
    });

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