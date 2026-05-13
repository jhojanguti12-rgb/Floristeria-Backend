const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    // Si llegamos aquí, enviamos un objeto que NADA puede romper
    res.json({
      inventario: stats.inventario,
      personal: stats.personal,
      pedidosCount: stats.pedidosCount,
      ventasTotal: stats.ventasTotal,
      pedidosLista: stats.pedidosLista,
      // Todas estas listas vacías evitan que los gráficos hagan "crash"
      ventasGrafico: [0, 0, 0, 0, 0, 0, 0],
      ventasMensuales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      series: [{ name: 'Ventas', data: [0, 0, 0, 0, 0, 0, 0] }],
      labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      ultimosPedidos: stats.pedidosLista,
      success: true
    });

  } catch (error) {
    res.json({ 
      inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, 
      pedidosLista: [], ventasGrafico: [], success: false 
    });
  }
};

module.exports = { getResumen };