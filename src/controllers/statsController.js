const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    res.json({
      inventario: stats.inventario,
      personal: stats.personal,
      pedidosCount: stats.pedidosCount,
      ventasTotal: stats.ventasTotal,
      pedidosLista: stats.pedidosLista,
      // Estos 3 son para evitar que los gráficos y tablas fallen por falta de datos
      ventasGrafico: [],
      ultimosPedidos: stats.pedidosLista,
      data: [] 
    });

  } catch (error) {
    res.json({ inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [], ventasGrafico: [] });
  }
};

module.exports = { getResumen };