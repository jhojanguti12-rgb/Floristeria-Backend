const db = require('../config/db');

const getResumenStats = async () => {
  try {
    const [floresRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const [usuariosRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    
    let pedidosCount = 0;
    let ventasTotal = 0;
    let pedidosLista = [];

    try {
      const [pedidosRows] = await db.query('SELECT COUNT(*) as total, SUM(total) as suma FROM pedidos');
      pedidosCount = pedidosRows[0]?.total || 0;
      ventasTotal = Number(pedidosRows[0]?.suma) || 0;

      // Traemos los datos reales de la tabla
      const [recientesRows] = await db.query('SELECT * FROM pedidos ORDER BY id DESC LIMIT 5');
      
      // MAPEAREMOS LOS CAMPOS MANUALMENTE PARA ASEGURAR COMPATIBILIDAD
      pedidosLista = recientesRows.map(p => ({
        id: p.id,
        // Probamos con todos los nombres posibles que tu frontend podría buscar:
        cliente: p.cliente || p.nombre || "Cliente General",
        total: p.total || 0,
        fecha: p.fecha || new Date().toISOString()
      }));

    } catch (e) {
      console.warn("Aviso: No se pudieron cargar los detalles de pedidos.");
    }

    return {
      inventario: floresRows[0]?.total || 0,
      personal: usuariosRows[0]?.total || 0,
      pedidosCount,
      ventasTotal,
      pedidosLista // <--- Este array ya lleva los datos listos
    };
  } catch (error) {
    console.error("Error en Service:", error);
    throw error;
  }
};

module.exports = { getResumenStats };