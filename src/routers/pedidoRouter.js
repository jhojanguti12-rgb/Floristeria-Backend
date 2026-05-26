const express = require('express');
const router = express.Router();
const pedidoService = require('../services/pedidoService');

// 1. OBTENER TODOS LOS PEDIDOS (Tu ruta original)
// URL: GET http://localhost:3000/api/pedidos
router.get('/', async (req, res, next) => {
    try {
        const pedidos = await pedidoService.getAllPedidos();
        res.json(pedidos);
    } catch (error) {
        next(error);
    }
});

// 2. CREAR PEDIDO (Tu ruta original - Une lo nuevo con la lógica de stock)
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


// ==========================================
// 🌟 NUEVAS RUTAS EXCLUSIVAS PARA EL ADMIN PANEL
// ==========================================

// 3. OBTENER LISTA DE PEDIDOS OPTIMIZADA PARA ADMIN
// URL: GET http://localhost:3000/api/pedidos/admin/lista
router.get('/admin/lista', async (req, res, next) => {
    try {
        const pedidosAdmin = await pedidoService.getAdminPedidosLista();
        res.json(pedidosAdmin);
    } catch (error) {
        next(error);
    }
});

// 4. OBTENER LAS FLORES DE UN PEDIDO ESPECÍFICO
// URL: GET http://localhost:3000/api/pedidos/admin/detalle/:id_pedido
router.get('/admin/detalle/:id_pedido', async (req, res, next) => {
    try {
        const { id_pedido } = req.params;
        const detalle = await pedidoService.getAdminPedidoDetalle(id_pedido);
        res.json(detalle);
    } catch (error) {
        next(error);
    }
});

// 5. ACTUALIZAR EL ESTADO LOGÍSTICO DEL PEDIDO
// URL: PUT http://localhost:3000/api/pedidos/admin/cambiar-estado/:id
router.put('/admin/cambiar-estado/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // 'Pendiente', 'En Preparacion', 'En Camino', 'Entregado'
        const resultado = await pedidoService.updatePedidoEstado(id, estado);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

module.exports = router;