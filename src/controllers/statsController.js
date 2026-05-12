const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    const respuesta = {
      inventario: Number(stats.inventario) || 0,
      personal: Number(stats.personal) || 0,
      pedidosCount: Number(stats.pedidosCount) || 0,
      ventasTotal: Number(stats.ventasTotal) || 0,
      pedidosLista: Array.isArray(stats.pedidosLista) ? stats.pedidosLista : [],
      // ESTO EVITA LA PANTALLA BLANCA (Gráficos y Tablas)
      ventasGrafico: [0, 0, 0, 0, 0, 0, 0], 
      ultimosPedidos: Array.isArray(stats.pedidosLista) ? stats.pedidosLista : [],
      data: [],
      success: true
    };

    res.json(respuesta);
  } catch (error) {
    res.json({ 
      inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, 
      pedidosLista: [], ventasGrafico: [], success: false 
    });
  }
};

module.exports = { getResumen };