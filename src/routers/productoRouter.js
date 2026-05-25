const express = require('express');
const router = express.Router();
const productoService = require('../services/productoService');

// GET para ver qué flores tienes
router.get('/', async (req, res) => {
    try {
        const flores = await productoService.getAllFlores();
        res.json(flores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const express = require('express');
const router = express.Router();
const productoService = require('../services/productoService');

// GET para ver qué flores tienes
router.get('/', async (req, res) => {
    try {
        const flores = await productoService.getAllFlores();
        res.json(flores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🌟 ACTUALIZADO: PUT para editar por completo los datos de una flor
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, categoria, stock, precio } = req.body;
        
        // Ejecutamos la actualización completa en la base de datos relacional
        await productoService.updateFlor(id, { nombre, categoria, stock, precio });
        
        console.log(`📝 Inventario: La flor con ID ${id} fue editada con éxito (Nombre: ${nombre}, Cat: ${categoria}, Stock: ${stock}, Precio: ${precio}).`);
        res.json({ mensaje: "✅ Flor actualizada correctamente en la base de datos." });
    } catch (error) {
        console.error("❌ Error al actualizar la flor:", error.message);
        res.status(400).json({ error: error.message });
    }
});

// DELETE para eliminar una flor permanentemente
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await productoService.deleteFlor(id);
        
        console.log(`🗑️ Inventario: Flor con ID ${id} eliminada.`);
        res.json({ mensaje: "✅ Flor eliminada correctamente del sistema" });
    } catch (error) {
        console.error("❌ Error al eliminar flor:", error.message);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
// 🌟 NUEVO: DELETE para eliminar una flor permanentemente
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Llamamos al servicio para eliminar
        await productoService.deleteFlor(id);
        
        console.log(`🗑️ Inventario: Flor con ID ${id} eliminada.`);
        res.json({ mensaje: "✅ Flor eliminada correctamente del sistema" });
    } catch (error) {
        console.error("❌ Error al eliminar flor:", error.message);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;