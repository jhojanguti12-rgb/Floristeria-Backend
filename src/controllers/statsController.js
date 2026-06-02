const statsService = require('../services/statsService');

const statsController = {
    // Método comercial del Dashboard (se mantiene intacto)
    getResumen: async (req, res, next) => {
        try {
            const stats = await statsService.getResumenStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    },

    // =================================================================
    // 🚀 NUEVO MÉTODO PARA EL PARCIAL (RF-01, RF-02, RF-03)
    // =================================================================
    ejecutarParcialPerformance: async (req, res) => {
        try {
            console.log("⏳ Ejecutando pruebas de stress-test para el parcial...");

            // 1. Requerimiento RF-01: Insertar masivamente 1050 datos
            const cantidadAInsertar = 1050;
            await statsService.ejecutarStressTestInyeccion(cantidadAInsertar);

            // 2. Medir Latencia en milisegundos (RF-03)
            const tiempoInicio = performance.now();

            // 3. Requerimiento RF-02: Conteo total de filas
            const totalRegistros = await statsService.obtenerConteoFilasParcial();

            const tiempoFin = performance.now();
            const latenciaCalculada = (tiempoFin - tiempoInicio).toFixed(2);

            // Retornamos la respuesta perfecta en JSON
            return res.status(200).json({
                evaluacion_practica: "Parcial Base de Datos - Pruebas de Carga e Inyección Masiva",
                estado_servidor: "Exitoso (Funcionando en la nube de Render)",
                analisis_desempeno: {
                    RF_01: {
                        requerimiento: "RF-01: Insertar más de 1000 registros a la base de datos.",
                        resultado: `Éxito rotundo. Se inyectaron ${cantidadAInsertar} registros simulados en la tabla de proveedores mediante bloques de transacciones.`
                    },
                    RF_02: {
                        requerimiento: "RF-02: Realizar una consulta para saber cuántos registros tiene la tabla.",
                        tabla_seleccionada: "proveedores",
                        registros_totales_contados: totalRegistros
                    },
                    RF_03: {
                        requerimiento: "RF-03: Medir la latencia de la consulta anterior.",
                        latencia_aiven_mysql: `${latenciaCalculada} ms`,
                        diagnostico: "Tiempo transcurrido desde el servidor hasta la base de datos distribuida en Aiven."
                    }
                }
            });

        } catch (error) {
            console.error("💥 Error en controlador parcial:", error.message);
            return res.status(500).json({
                error: "La prueba de rendimiento falló",
                detalles_tecnicos: error.message
            });
        }
    }
};

module.exports = statsController;