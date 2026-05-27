const express = require('express');
const router = express.Router();
const categoriaService = require('../services/categoriaService');

// 1. Listar categorías (GET /api/categorias)
router.get('/', async (req, res, next) => {
    try {
        const categorias = await categoriaService.getAllCategorias();
        res.json(categorias);
    } catch (error) {
        next(error);
    }
});

// 2. Crear categoría (POST /api/categorias) - MODO DIAGNÓSTICO DE MYSQL
router.post('/', async (req, res, next) => {
    try {
        const nombre = req.body && req.body.nombre ? req.body.nombre.toString().trim() : '';
        const descripcion = req.body && req.body.descripcion ? req.body.descripcion.toString().trim() : '';

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es requerido" });
        }

        const resultado = await categoriaService.createCategoria({ nombre, descripcion });
        const nuevoId = resultado && resultado.insertId ? resultado.insertId : Math.floor(Math.random() * 1000);

        return res.status(201).json({ 
            id: nuevoId, 
            nombre: nombre, 
            descripcion: descripcion 
        });

    } catch (error) {
        console.error("💥 Error capturado en el Router POST:", error.message);
        
        // 🌟 CAMBIO CLAVE: Devolvemos el "error.message" real de MySQL a la alerta de la pantalla
        return res.status(500).json({ error: error.message });
    }
});
// 3. Eliminar categoría (DELETE /api/categorias/:id)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await categoriaService.deleteCategoria(id); 
        res.json({ mensaje: "Categoría eliminada con éxito" });
    } catch (error) {
        next(error);
    }
});

// 4. Ver flores por categoría (GET /api/categorias/:id/flores)
router.get('/:id/flores', async (req, res, next) => {
    try {
        const flores = await categoriaService.getFloresByCategoria(req.params.id);
        res.json(flores);
    } catch (error) {
        next(error);
    }
});

module.exports = router;