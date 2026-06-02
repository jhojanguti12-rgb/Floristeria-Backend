const statsService = require('../services/statsService');

const statsController = {
    getResumen: async (req, res, next) => {
        try {
            const stats = await statsService.getResumenStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    },

    // Controlador para responder al navegador tras el éxito de la carga
    ejecutarParcialPerformance: async (req, res) => {
        try {
            console.log("⏳ Iniciando la inyección masiva de 1050 flores...");
            const cantidadProductos = 1050;
            
            await statsService.ejecutarInyeccionMasivaFlores(cantidadProductos);

            return res.status(200).json({
                punto_evaluado: "RF-01: Insertar más de 1000 registros a la base de datos (Productos)",
                estado: "Exitoso",
                mensaje: `Se han inyectado de forma automatizada ${cantidadProductos} productos reales (Flores) bajo la categoría 11 (flores ornamentales) en Aiven MySQL.`
            });

        } catch (error) {
            console.error("💥 Error en el controlador de flores masivas:", error.message);
            return res.status(500).json({
                error: "El requerimiento RF-01 falló",
                detalles: error.message
            });
        }
    }
};

module.exports = statsController;