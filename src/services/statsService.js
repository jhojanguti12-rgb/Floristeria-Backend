const db = require('../config/db');

const getResumenStats = async () => {
  try {
    console.log("--- Iniciando consulta de estadísticas ---");

    // 1. Validar conexión y contar flores
    console.log("Consultando tabla: flores...");
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const totalFlores = floresRows[0]?.total || 0;
    console.log("Flores encontradas:", totalFlores);

    // 2. Contar usuarios
    console.log("Consultando tabla: usuarios...");
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsuarios = usuariosRows[0]?.total || 0;
    console.log("Usuarios encontrados:", totalUsuarios);

    // 3. Bloque seguro para pedidos (por si la tabla no existe aún)
    let pedidosCount = 0;
    let ventasTotal = 0;
    try {
      const [pedidosRows] = await db.query('SELECT COUNT(*) as total FROM pedidos');
      const [ventasRows] = await db.query('SELECT SUM(total) as totalVentas FROM pedidos');
      pedidosCount = pedidosRows[0]?.total || 0;
      ventasTotal = ventasRows[0]?.totalVentas || 0;
    } catch (e) {
      console.warn("Aviso: La tabla 'pedidos' no respondió (puede que no exista).");
    }

    return {
      inventario: totalFlores,
      personal: totalUsuarios,
      pedidosCount,
      ventasTotal,
      pedidosLista: []
    };
    
  } catch (error) {
    // ESTO ES LO MÁS IMPORTANTE: Verás el error real en los logs de Render
    console.error("❌ ERROR CRÍTICO EN STATSSERVICE:", error.message);
    throw error;
  }
};

module.exports = { getResumenStats };