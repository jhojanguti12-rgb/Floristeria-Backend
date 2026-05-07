const express = require('express');
const router = express.Router();
const clienteService = require('../services/clienteService');

// Ver todos los clientes: http://localhost:3000/api/clientes/todos
router.get('/todos', async (req, res, next) => {
    try {
        const clientes = await clienteService.getAllClientes();
        res.json(clientes);
    } catch (error) {
        next(error);
    }
});

// Crear un cliente nuevo
router.post('/registrar', async (req, res, next) => {
    try {
        const nuevo = await clienteService.createCliente(req.body);
        res.status(201).json({ mensaje: "✅ Cliente registrado", id: nuevo.insertId });
    } catch (error) {
        next(error);
    }
});

module.exports = router;