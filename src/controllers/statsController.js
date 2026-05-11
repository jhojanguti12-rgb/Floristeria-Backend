const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    // Aquí obligamos a que todo tenga el formato perfecto para el frontend
    res.json({
      inventario: Number(stats.inventario) || 0,
      personal: Number(stats.personal) || 0,
      pedidosCount: Number(stats.pedidosCount) || 0,
      ventasTotal: Number(stats.ventasTotal) || 0,
      // Si la lista está mal, mandamos una vacía para que no explote el .map()
      pedidosLista: Array.isArray(stats.pedidosLista) ? stats.pedidosLista : [],
      // Esto es vital para los gráficos del frontend
      ventasGrafico: [] 
    });

  } catch (error) {
    console.error("Error en Controller:", error);
    res.json({
      inventario: 0,
      personal: 0,
      pedidosCount: 0,
      ventasTotal: 0,
      pedidosLista: [],
      ventasGrafico: []
    });
  }
};

module.exports = { getResumen };