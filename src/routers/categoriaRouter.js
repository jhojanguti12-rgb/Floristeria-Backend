const express = require('express');
const router = express.Router();
const categoriaService = require('../services/categoriaService');

// 1. NUEVA MEJORA: Obtener TODAS las categorías 
// Esta es la que necesita tu Modal de Producto para llenar el selector (select)
router.get('/', async (req, res, next) => {
    try {
        const categorias = await categoriaService.getAllCategorias();
        res.json(categorias);
    } catch (error) {
        next(error);
    }
});

// 2. Ruta para que el Admin añada una categoría
router.post('/crear', async (req, res, next) => {
    try {
        const resultado = await categoriaService.createCategoria(req.body);
        res.status(201).json({ mensaje: "Categoría añadida con éxito", id: resultado.insertId });
    } catch (error) {
        next(error);
    }
});

// 3. Ruta para ver flores de UNA sola categoría
router.get('/:id/flores', async (req, res, next) => {
    try {
        const flores = await categoriaService.getFloresByCategoria(req.params.id);
        res.json(flores);
    } catch (error) {
        next(error);
    }
});

module.exports = router;