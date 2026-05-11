const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
    try {
        // Llamamos a la función correcta del servicio
        const data = await statsService.getResumenStats();
        res.json(data);
    } catch (error) {
        console.error("❌ Error en el controlador de stats:", error.message);
        res.status(500).json({ 
            error: "Error al obtener datos reales",
            detalle: error.message 
        });
    }
};

module.exports = { getResumen };