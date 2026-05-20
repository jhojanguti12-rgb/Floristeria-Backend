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

// PUT para cambiar el stock
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        
        await productoService.updateStockFlor(id, stock);
        
        console.log(`🌸 Inventario: La flor con ID ${id} ahora tiene ${stock} unidades.`);
        res.json({ mensaje: `✅ Stock de flor actualizado correctamente a ${stock}` });
    } catch (error) {
        console.error("❌ Error al actualizar stock:", error.message);
        res.status(400).json({ error: error.message });
    }
});

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