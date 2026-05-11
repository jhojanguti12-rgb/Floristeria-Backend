const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const [pedidosRows] = await db.query('SELECT COUNT(*) as total, SUM(total) as suma FROM pedidos');

    let pedidosLista = [];
    try {
      // Traemos los pedidos pero SIN usar la columna fecha directamente por ahora
      // para evitar que React explote si el formato es raro.
      const [rows] = await db.query(`
        SELECT 
          p.id, 
          COALESCE(c.nombre, 'Cliente') as cliente, 
          p.total
        FROM pedidos p
        LEFT JOIN clientes c ON p.id_cliente = c.id
        ORDER BY p.id DESC LIMIT 5
      `);

      // Mapeamos manualmente para asegurar que cada campo sea un texto o número simple
      pedidosLista = rows.map(p => ({
        id: String(p.id),
        cliente: String(p.cliente),
        total: Number(p.total).toFixed(2),
        fecha: "Reciente" // Ponemos un texto fijo para probar si esto evita el error
      }));
    } catch (e) {
      console.log("Error en lista:", e.message);
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