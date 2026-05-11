const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    // Blindaje total de la respuesta
    res.json({
      inventario: Number(stats.inventario) || 0,
      personal: Number(stats.personal) || 0,
      pedidosCount: Number(stats.pedidosCount) || 0,
      ventasTotal: Number(stats.ventasTotal) || 0,
      pedidosLista: Array.isArray(stats.pedidosLista) ? stats.pedidosLista : [],
      // Esto previene el error "e.slice is not a function" del gráfico
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