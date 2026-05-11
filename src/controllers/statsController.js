const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    // Aseguramos que pedidosLista sea SIEMPRE un array
    const listaSegura = Array.isArray(stats.pedidosLista) ? stats.pedidosLista : [];

    res.json({
      inventario: stats.inventario || 0,
      personal: stats.personal || 0,
      pedidosCount: stats.pedidosCount || 0,
      ventasTotal: stats.ventasTotal || 0,
      pedidosLista: listaSegura,
      // ESTO ES PARA EL GRÁFICO (El error e.slice)
      ventasGrafico: [] 
    });

  } catch (error) {
    res.status(200).json({
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