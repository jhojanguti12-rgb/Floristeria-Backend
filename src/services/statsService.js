const db = require('../config/db');

const getResumenStats = async () => {
  try {
    // Usamos desestructuración clara: [filas]
    const [resFlores] = await db.query('SELECT COUNT(*) as t FROM flores');
    const [resUsuarios] = await db.query('SELECT COUNT(*) as t FROM usuarios');
    const [resPedidosT] = await db.query('SELECT COUNT(*) as t, SUM(total) as s FROM pedidos');
    
    const [filasPedidos] = await db.query(`
      SELECT 
        p.id, 
        p.total, 
        IFNULL(c.nombre, 'Cliente Anónimo') AS nombre_cliente
      FROM pedidos p 
      LEFT JOIN clientes c ON p.id_cliente = c.id 
      ORDER BY p.id DESC 
      LIMIT 5
    `);

    // Extraemos los valores con seguridad total
    const inventario = resFlores[0]?.t || 0;
    const personal = resUsuarios[0]?.t || 0;
    const pedidosCount = resPedidosT[0]?.t || 0;
    const ventasTotal = Number(resPedidosT[0]?.s) || 0;

    // Mapeo de la lista
    const pedidosLista = Array.isArray(filasPedidos) ? filasPedidos.map(p => ({
      id: p.id, // Esto ahora llegará como número o string pero App.jsx ya lo maneja
      cliente: p.nombre_cliente || "Sin Nombre",
      nombre: p.nombre_cliente || "Sin Nombre",
      total: Number(p.total) || 0,
      status: "completado"
    })) : [];

    return {
      inventario,
      personal,
      pedidosCount,
      ventasTotal,
      pedidosLista,
      ventasGrafico: [0, 0, 0, 0, 0, 0, 0]
    };

  } catch (error) {
    console.error("❌ Error en statsService:", error);
    return { 
      inventario: 0, 
      personal: 0, 
      pedidosCount: 0, 
      ventasTotal: 0, 
      pedidosLista: [],
      ventasGrafico: [0, 0, 0, 0, 0, 0, 0]
    };
  }
};

module.exports = { getResumenStats };