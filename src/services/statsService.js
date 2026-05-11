const db = require('../config/db');

const getResumenStats = async () => {
  try {
    // 1. Contamos las flores (usando el nombre exacto de tu captura: flores)
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const totalFlores = floresRows[0].total;

    // 2. Contamos los usuarios (usando el nombre exacto: usuarios)
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsuarios = usuariosRows[0].total;

    // 3. Para pedidos y ventas, usamos un bloque seguro por si las tablas están vacías
    let pedidosCount = 0;
    let ventasTotal = 0;

    try {
      const [pedidosRows] = await db.query('SELECT COUNT(*) as total FROM pedidos');
      const [ventasRows] = await db.query('SELECT SUM(total) as totalVentas FROM pedidos');
      pedidosCount = pedidosRows[0].total;
      ventasTotal = ventasRows[0].totalVentas || 0;
    } catch (err) {
      console.log("Tablas de pedidos/ventas aún no listas o vacías.");
    }

    return {
      inventario: totalFlores,
      personal: totalUsuarios,
      pedidosCount: pedidosCount,
      ventasTotal: ventasTotal,
      pedidosLista: []
    };
    
  } catch (error) {
    // Esto nos dirá exactamente qué tabla o qué campo falla en los logs de Render
    console.error("Error detallado en statsService:", error.message);
    throw error; 
  }
};

module.exports = { getResumenStats };