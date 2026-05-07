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
        const imagenPath = req.file ? `/uploads/${req.file.filename}` : null;

        // Limpiamos los datos para asegurar que MySQL reciba los tipos correctos
        const flowerData = {
            nombre: req.body.nombre,
            precio: parseFloat(req.body.precio),
            stock: parseInt(req.body.stock),
            id_categoria: parseInt(req.body.id_categoria), // Aseguramos que sea número
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
        // Imprimimos el error real en la consola de VS Code para que lo veas
        console.error("ERROR AL CREAR EN DB:", error);
        next(error);
    }
});

// ... resto de rutas (editar, estado, eliminar) se mantienen igual ...
module.exports = router;
