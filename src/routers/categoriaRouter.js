const express = require('express');
const router = express.Router();
const categoriaService = require('../services/categoriaService');

// 1. Obtener TODAS las categorías (GET /api/categorias)
router.get('/', async (req, res, next) => {
    try {
        const categorias = await categoriaService.getAllCategorias();
        res.json(categorias);
    } catch (error) {
        next(error);
    }
});

// 2. Añadir una categoría (POST /api/categorias)
router.post('/', async (req, res, next) => {
    try {
        const { nombre, descripcion } = req.body;
        const resultado = await categoriaService.createCategoria(req.body);
        
        // Devolvemos el formato exacto de objeto que el Frontend de React espera meter en su tabla
        res.status(201).json({ 
            id: resultado.insertId || resultado.id, 
            nombre, 
            descripcion 
        });
    } catch (error) {
        next(error);
    }
});

// 3. 🌟 ELIMINAR CATEGORÍA CORREGIDO: (DELETE /api/categorias/:id)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        // LLAMAMOS AL MÉTODO EXACTO DE TU SERVICIO: deleteCategoria
        await categoriaService.deleteCategoria(id); 
        res.json({ mensaje: "Categoría eliminada con éxito" });
    } catch (error) {
        next(error);
    }
});

// 4. Ver flores de una sola categoría (GET /api/categorias/:id/flores)
router.get('/:id/flores', async (req, res, next) => {
    try {
        const flores = await categoriaService.getFloresByCategoria(req.params.id);
        res.json(flores);
    } catch (error) {
        next(error);
    }
});

module.exports = router;