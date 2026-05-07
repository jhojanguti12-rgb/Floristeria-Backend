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

// PUT para cambiar el stock (el que probaremos con "stock: 8")
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

module.exports = router;