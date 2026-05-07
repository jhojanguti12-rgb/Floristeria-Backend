const express = require('express');
const router = express.Router();
const proveedorService = require('../services/proveedorService');

router.post('/registrar', async (req, res, next) => {
    try {
        const resultado = await proveedorService.crearProveedor(req.body);
        res.status(201).json({ mensaje: "✅ Proveedor registrado", id_proveedor: resultado.insertId });
    } catch (error) {
        next(error);
    }
});

router.get('/todos', async (req, res, next) => {
    try {
        const proveedores = await proveedorService.getAllProveedores();
        res.json(proveedores);
    } catch (error) {
        next(error);
    }
});

module.exports = router;