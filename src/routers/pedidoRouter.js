const express = require('express');
const router = express.Router();
const pedidoService = require('../services/pedidoService');

// 1. OBTENER TODOS LOS PEDIDOS
// URL: GET http://localhost:3000/api/pedidos
router.get('/', async (req, res, next) => {
    try {
        const pedidos = await pedidoService.getAllPedidos();
        res.json(pedidos);
    } catch (error) {
        next(error);
    }
});

// 2. CREAR PEDIDO (Une lo nuevo con la lógica de stock)
// URL: POST http://localhost:3000/api/pedidos
router.post('/', async (req, res, next) => {
    try {
        // 'req.body' debe traer: id_cliente, id_empleado, total y el array de productos
        const resultado = await pedidoService.createPedido(req.body);
        
        res.status(201).json({
            mensaje: "🚀 Venta exitosa e inventario actualizado.",
            pedidoId: resultado.id
        });
    } catch (error) {
        // Si el error es por falta de stock, enviamos un mensaje claro
        if (error.message.includes('Stock insuficiente')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

module.exports = router;