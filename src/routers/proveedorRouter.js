const express = require('express');
const router = express.Router();
const proveedorService = require('../services/proveedorService');

// Busca el GET '/' y déjalo así:
router.get('/', async (req, res) => {
    try {
        const proveedores = await proveedorService.getAllProveedores();
        res.json(proveedores);
    } catch (error) {
        console.error("💥 Error en GET proveedores:", error);
        // 🚨 ENVIAMOS EL MENSAJE REAL DE MYSQL AL FRONTEND
        res.status(500).json({ error: error.message || "Error interno" });
    }
});

// Busca el POST '/' y déjalo así:
router.post('/', async (req, res) => {
    try {
        const nuevo = await proveedorService.createProveedor(req.body);
        res.status(201).json(nuevo);
    } catch (error) {
        console.error("💥 Error en POST proveedores:", error);
        // 🚨 ENVIAMOS EL MENSAJE REAL DE MYSQL AL FRONTEND
        res.status(500).json({ error: error.message || "Error interno" });
    }
});
// 3. Editar un proveedor existente (PUT /api/proveedores/:id)
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const nombre = req.body && req.body.nombre ? req.body.nombre.toString().trim() : '';
        const telefono = req.body && req.body.telefono ? req.body.telefono.toString().trim() : '';
        const contacto_nombre = req.body && req.body.contacto_nombre ? req.body.contacto_nombre.toString().trim() : '';

        if (!nombre || !telefono) {
            return res.status(400).json({ error: "El nombre y el teléfono son requeridos para actualizar" });
        }

        await proveedorService.actualizarProveedor(id, { nombre, telefono, contacto_nombre });

        return res.json({ id: Number(id), nombre, telefono, contacto_nombre });
    } catch (error) {
        console.error("💥 Error en el Router PUT Proveedores:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

// 4. Eliminar un proveedor (DELETE /api/proveedores/:id)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await proveedorService.eliminarProveedor(id); 
        res.json({ mensaje: "✅ Proveedor eliminado con éxito" });
    } catch (error) {
        console.error("💥 Error en el Router DELETE Proveedores:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;