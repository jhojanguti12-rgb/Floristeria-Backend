const express = require('express');
const router = express.Router();
const pagoService = require('../services/pagoService');

// Ruta: POST http://localhost:3000/api/pagos/registrar
router.post('/registrar', async (req, res, next) => {
    try {
        const resultado = await pagoService.crearPago(req.body);
        res.status(201).json({ 
            mensaje: "✅ Pago registrado con éxito", 
            id_pago: resultado.insertId 
        });
    } catch (error) {
        next(error);
    }
});

// Ruta: GET http://localhost:3000/api/pagos/historial
router.get('/historial', async (req, res, next) => {
    try {
        const pagos = await pagoService.obtenerHistorialPagos();
        res.json(pagos);
    } catch (error) {
        next(error);
    }
});

module.exports = router;