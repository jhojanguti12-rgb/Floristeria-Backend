const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    // Si por alguna razón el servicio no trae la lista, 
    // nos aseguramos de enviar un array para que el frontend no rompa
    res.json({
      ...stats,
      pedidosLista: stats.pedidosLista || [],
      pedidos: stats.pedidosLista || []
    });
  } catch (error) {
    console.error("Error en statsController:", error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = { getResumen };