const statsService = require('../services/statsService');

const getResumen = async (req, res) => {
    try {
        const data = await statsService.getResumenStats();
        res.json(data);
    } catch (error) {
        console.error("Error en stats:", error);
        res.status(500).json({ error: "Error al obtener datos reales" });
    }
};

module.exports = { getResumen };