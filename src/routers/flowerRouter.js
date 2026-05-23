const express = require('express');
const router = express.Router();
const flowerService = require('../services/flowerService');
const { uploadWithErrorHandler } = require('../middlewares/uploadsMiddleware'); 
const verificarToken = require('../middlewares/authMiddleware');

// 1. OBTENER TODAS LAS FLORES
router.get('/', async (req, res, next) => {
    try {
        const flores = await flowerService.getAllFlores();
        res.json(flores);
    } catch (error) {
        next(error);
    }
});
// 2. CREAR UNA FLOR (CON FOTO)
router.post('/crear', verificarToken, uploadWithErrorHandler, async (req, res, next) => {
    try {
       const imagenPath = req.file ? req.file.path : 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600';
        const textoCategoria = req.body.categoria ? req.body.categoria.trim() : 'General';

        // 🔍 TRUCO INTELIGENTE: Buscamos si la categoría ya existe en MySQL
        const db = require('../config/db');
        const [catExiste] = await db.query('SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?)', [textoCategoria]);
        
        let categoriaId;

        if (catExiste.length > 0) {
            // Si ya existe, tomamos su ID numérico
            categoriaId = catExiste[0].id;
        } else {
            // Si es nueva, la insertamos automáticamente en la tabla de categorías
            const [nuevaCat] = await db.query('INSERT INTO categorias (nombre) VALUES (?)', [textoCategoria]);
            categoriaId = nuevaCat.insertId; // Tomamos el ID recién generado
        }

        // 📦 Sincronización perfecta de datos limpios para MySQL
        const flowerData = {
            nombre: req.body.nombre,
            precio: parseFloat(req.body.precio) || 0,
            stock: parseInt(req.body.stock) || 0,
            id_categoria: categoriaId, // 👈 ¡Ahora sí le pasamos el número exacto que espera!
            color: req.body.color || 'Sin color',
            imagen_url: imagenPath
        };

        const resultado = await flowerService.createFlower(flowerData);

        res.status(201).json({
            mensaje: "¡Flor añadida correctamente!",
            id: resultado.insertId,
            fotoRuta: imagenPath
        });
    } catch (error) {
        console.error("ERROR AL CREAR EN DB:", error);
        next(error);
    }
});
// ... resto de rutas (editar, estado, eliminar) se mantienen igual ...
module.exports = router;
// =========================================================================
// 🗑️ NUEVO: DELETE para eliminar una flor permanentemente de la base de datos
// =========================================================================
router.delete('/:id', verificarToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Llamamos al servicio de flores para eliminarla de MySQL
        await flowerService.deleteFlower(id); 
        
        console.log(`🗑️ Inventario: Flor con ID ${id} eliminada correctamente.`);
        res.json({ mensaje: "✅ Flor eliminada correctamente del sistema" });
    } catch (error) {
        console.error("❌ Error al eliminar la flor:", error.message);
        next(error);
    }
});