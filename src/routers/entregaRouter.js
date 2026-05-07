const express = require('express');
const router = express.Router();
const entregaService = require('../services/entregaService');

router.post('/programar', async (req, res, next) => {
    try {
        const resultado = await entregaService.crearEntrega(req.body);
        res.status(201).json({ mensaje: "🚚 Entrega programada", id_entrega: resultado.insertId });
    } catch (error) {
        next(error);
    }
});

router.put('/actualizar-estado/:id', async (req, res, next) => {
    try {
        const { estado } = req.body;
        await entregaService.actualizarEstado(req.params.id, estado);
        res.json({ mensaje: "✅ Estado de entrega actualizado" });
    } catch (error) {
        next(error);
    }
});

router.get('/pendientes', async (req, res, next) => {
    try {
        const entregas = await entregaService.listarEntregasProximas();
        res.json(entregas);
    } catch (error) {
        next(error);
    }
});

module.exports = router;