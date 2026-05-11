const db = require('../config/db');

const getResumenStats = async () => {
  try {
    // 1. Contamos las flores
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const totalFlores = floresRows[0]?.total || 0;

    // 2. Contamos los usuarios
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsuarios = usuariosRows[0]?.total || 0;

    // 3. Bloque de Pedidos y Ventas
    let pedidosCount = 0;
    let ventasTotal = 0;
    let pedidosLista = [];

    try {
      // Intentamos obtener el conteo y la suma
      // Usamos COALESCE para que si es NULL devuelva 0
      const [pedidosRows] = await db.query('SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as suma FROM pedidos');
      
      pedidosCount = pedidosRows[0]?.total || 0;
      ventasTotal = pedidosRows[0]?.suma || 0;

      // Intentamos traer la lista. 
      // IMPORTANTE: Si tu columna no se llama 'cliente', cámbiala aquí por el nombre correcto
      const [recientesRows] = await db.query('SELECT * FROM pedidos ORDER BY id DESC LIMIT 5');
      
      // Mapeamos los datos para que el frontend los entienda sí o sí
      pedidosLista = recientesRows.map(p => ({
        id: p.id,
        cliente: p.cliente || p.nombre_cliente || p.usuario || "Sin nombre",
        total: p.total || p.monto || 0,
        fecha: p.fecha || p.created_at || new Date()
      }));

    } catch (e) {
      console.error("⚠️ Error específico en tabla pedidos:", e.message);
      // Si la tabla no existe o falla, al menos devolvemos lo que tenemos
    }

    return {
      inventario: totalFlores,
      personal: totalUsuarios,
      pedidosCount: pedidosCount,
      ventasTotal: ventasTotal,
      pedidosLista: pedidosLista
    };
    
  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN STATSSERVICE:", error.message);
    throw error;
  }
};

module.exports = { getResumenStats };