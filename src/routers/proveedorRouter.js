const express = require('express');
const router = express.Router();
const proveedorService = require('../services/proveedorService');

// 1. Listar todos los proveedores (GET /api/proveedores)
router.get('/', async (req, res, next) => {
    try {
        const proveedores = await proveedorService.getAllProveedores();
        res.json(proveedores);
    } catch (error) {
        console.error("💥 Error en el Router GET Proveedores:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

// 2. Registrar un nuevo proveedor (POST /api/proveedores)
router.post('/', async (req, res, next) => {
    try {
        const nombre = req.body && req.body.nombre ? req.body.nombre.toString().trim() : '';
        const telefono = req.body && req.body.telefono ? req.body.telefono.toString().trim() : '';
        const contacto_nombre = req.body && req.body.contacto_nombre ? req.body.contacto_nombre.toString().trim() : '';

        if (!nombre || !telefono) {
            return res.status(400).json({ error: "El nombre y el teléfono son requeridos" });
        }

        // Ejecutamos el servicio para guardar en MySQL
        const resultado = await proveedorService.createProveedor({ nombre, telefono, contacto_nombre });
        
        const nuevoId = resultado && resultado.insertId ? resultado.insertId : Math.floor(Math.random() * 1000);

        // Devolvemos el objeto tal como lo espera tu Frontend para pintarlo en la tabla
        return res.status(201).json({ 
            id: nuevoId, 
            nombre, 
            telefono, 
            contacto_nombre 
        });

    } catch (error) {
        console.error("💥 Error en el Router POST Proveedores:", error.message);
        // Esto le enviará el mensaje real del error (por ejemplo, si falta una columna o la tabla está mal)
        return res.status(500).json({ error: error.message });
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