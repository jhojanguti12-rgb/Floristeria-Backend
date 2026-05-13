const db = require('../config/db');

const getResumenStats = async () => {
  try {
    // 1. Usamos consultas individuales con manejo de errores por cada una
    const [flores] = await db.query('SELECT COUNT(*) as t FROM flores');
    const [usuarios] = await db.query('SELECT COUNT(*) as t FROM usuarios');
    const [pedidosT] = await db.query('SELECT COUNT(*) as t, SUM(total) as s FROM pedidos');
    
    // 2. CAMBIO CLAVE: Usamos LEFT JOIN en lugar de INNER JOIN
    // Esto garantiza que si el cliente no existe, el pedido IGUAL aparezca
    const [filas] = await db.query(`
      SELECT 
        p.id, 
        p.total, 
        IFNULL(c.nombre, 'Cliente Anónimo') AS nombre_cliente
      FROM pedidos p 
      LEFT JOIN clientes c ON p.id_cliente = c.id 
      ORDER BY p.id DESC 
      LIMIT 5
    `);

    // 3. Mapeo ultra-seguro
    // Si 'filas' no es un array por algún error raro, evitamos que rompa
    const pedidosLista = Array.isArray(filas) ? filas.map(p => ({
      id: p.id,
      cliente: p.nombre_cliente || "Sin Nombre",
      nombre: p.nombre_cliente || "Sin Nombre",
      total: Number(p.total) || 0,
      status: "completado"
    })) : [];

    // 4. Estructura de retorno garantizada
    const respuesta = {
      inventario: (flores && flores[0]) ? flores[0].t : 0,
      personal: (usuarios && usuarios[0]) ? usuarios[0].t : 0,
      pedidosCount: (pedidosT && pedidosT[0]) ? pedidosT[0].t : 0,
      ventasTotal: (pedidosT && pedidosT[0]) ? Number(pedidosT[0].s || 0) : 0,
      pedidosLista: pedidosLista
    };

    console.log("Stats enviadas al front:", respuesta); // Para que lo veas en tu terminal de Node
    return respuesta;

  } catch (error) {
    console.error("❌ Error crítico en statsService:", error);
    // IMPORTANTE: Siempre devolver la estructura completa aunque falle
    return { 
      inventario: 0, 
      personal: 0, 
      pedidosCount: 0, 
      ventasTotal: 0, 
      pedidosLista: [] 
    };
  }
};

module.exports = { getResumenStats };