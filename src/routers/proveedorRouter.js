const express = require('express');
const router = express.Router();
const proveedorService = require('../services/proveedorService');

// 1. Obtener todos los proveedores
// GET: /api/proveedores
router.get('/', async (req, res, next) => {
    try {
        const proveedores = await proveedorService.getAllProveedores();
        res.json(proveedores);
    } catch (error) {
        next(error);
    }
});

// 2. Registrar un nuevo proveedor
// POST: /api/proveedores
router.post('/', async (req, res, next) => {
    try {
        const resultado = await proveedorService.crearProveedor(req.body);
        res.status(201).json({ mensaje: "✅ Proveedor registrado", id_proveedor: resultado.insertId });
    } catch (error) {
        next(error);
    }
});

// 3. Editar un proveedor existente
// PUT: /api/proveedores/:id
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await proveedorService.actualizarProveedor(id, req.body);
        res.json({ mensaje: "✅ Proveedor actualizado con éxito" });
    } catch (error) {
        next(error);
    }
});

// 4. Eliminar un proveedor
// DELETE: /api/proveedores/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await proveedorService.eliminarProveedor(id);
        res.json({ mensaje: "✅ Proveedor eliminado con éxito" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;