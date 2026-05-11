const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    // IMPORTANTE: Aseguramos que todo sea del tipo correcto antes de enviar
    const respuestaSegura = {
      inventario: Number(stats.inventario) || 0,
      personal: Number(stats.personal) || 0,
      pedidosCount: Number(stats.pedidosCount) || 0,
      ventasTotal: Number(stats.ventasTotal) || 0,
      pedidosLista: Array.isArray(stats.pedidosLista) ? stats.pedidosLista : [],
      // Agregamos esto para evitar el error .slice() del gráfico
      ventasGrafico: [] 
    };

    res.json(respuestaSegura);

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