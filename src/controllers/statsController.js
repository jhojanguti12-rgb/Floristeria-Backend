const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
  try {
    const stats = await statsService.getResumenStats();
    
    /**
     * Construimos una respuesta "super-compatible".
     * Esto asegura que si el Frontend busca 'inventario' o 'totalFlores',
     * en ambos casos encuentre el dato.
     */
    res.json({
      // Datos principales del servicio
      inventario: stats.inventario || 0,
      personal: stats.personal || 0,
      pedidosCount: stats.pedidosCount || 0,
      ventasTotal: stats.ventasTotal || 0,
      
      // La lista de pedidos con múltiples nombres por si el Frontend es antiguo
      pedidosLista: stats.pedidosLista || [],
      pedidos: stats.pedidosLista || [],
      recientes: stats.pedidosLista || [],

      // Aliases adicionales para mayor seguridad
      totalFlores: stats.inventario || 0,
      totalUsuarios: stats.personal || 0,
      ventas: stats.ventasTotal || 0
    });

  } catch (error) {
    console.error("❌ Error en statsController:", error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      pedidosLista: [], // Enviamos array vacío para que el .map() del frontend no falle
      inventario: 0,
      personal: 0
    });
  }
};

module.exports = { getResumen };