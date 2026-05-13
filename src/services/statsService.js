const db = require('../config/db');

const getResumenStats = async () => {
  try {
    // Consultas básicas de conteo
    const [flores] = await db.query('SELECT COUNT(*) as t FROM flores');
    const [usuarios] = await db.query('SELECT COUNT(*) as t FROM usuarios');
    const [pedidosT] = await db.query('SELECT COUNT(*) as t, SUM(total) as s FROM pedidos');
    
    // LA CONSULTA CLAVE: Aquí es donde traemos el nombre del cliente
    const [filas] = await db.query(`
      SELECT 
        p.id, 
        p.total, 
        c.nombre AS nombre_cliente
      FROM pedidos p 
      INNER JOIN clientes c ON p.id_cliente = c.id 
      ORDER BY p.id DESC 
      LIMIT 5
    `);

    // Mapeamos los datos para que el Frontend los entienda sin importar el nombre de la variable
    const pedidosLista = filas.map(p => ({
      id: p.id,
      cliente: p.nombre_cliente, // El nombre que viene del JOIN
      nombre: p.nombre_cliente,  // Lo duplicamos por si acaso
      total: p.total,
      status: "completado"
    }));

    return {
      inventario: flores[0]?.t || 0,
      personal: usuarios[0]?.t || 0,
      pedidosCount: pedidosT[0]?.t || 0,
      ventasTotal: Number(pedidosT[0]?.s || 0),
      pedidosLista: pedidosLista
    };
  } catch (error) {
    console.error("Error en statsService:", error);
    return { inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] };
  }
};

module.exports = { getResumenStats };