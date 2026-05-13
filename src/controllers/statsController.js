const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    res.json({
      ...stats, // Esto envía todo lo del service
      // Si el frontend usa alguna de estas, ahora tendrá a Maria Garcia
      pedidos: stats.pedidosLista,
      orders: stats.pedidosLista,
      data: stats.pedidosLista,
      ventasGrafico: [10, 20, 15, 30, 25, 40, 35] // Pongamos números para ver si el gráfico se mueve
    });

  } catch (error) {
    res.json({ success: false });
  }
};

module.exports = { getResumen };