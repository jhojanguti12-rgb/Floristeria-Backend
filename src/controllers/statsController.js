const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    // Enviamos una estructura fija que el Frontend entienda perfectamente
    res.json({
      inventario: stats.inventario || 0,
      personal: stats.personal || 0,
      pedidosCount: stats.pedidosCount || 0,
      ventasTotal: stats.ventasTotal || 0,
      pedidosLista: stats.pedidosLista || [], // Este nombre es el que usa el App.jsx
      ventasGrafico: [10, 20, 15, 30, 25, 40, 35] 
    });

  } catch (error) {
    console.error("Error en Controller:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

module.exports = { getResumen };