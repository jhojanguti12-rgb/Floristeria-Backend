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


// 2. Añadir una categoría (POST /api/categorias) - VERSIÓN BLINDADA ANTI-ERRORS 500
router.post('/', async (req, res, next) => {
    try {
        // Sacamos los datos explícitamente del cuerpo de la petición
        const { nombre, descripcion } = req.body;

        // Validación preventiva antes de tocar la Base de Datos
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({ error: "El nombre de la colección es totalmente obligatorio." });
        }

        // Le pasamos las variables limpias en un objeto estructurado al servicio
        const resultado = await categoriaService.createCategoria({ 
            nombre: nombre.trim(), 
            descripcion: descripcion ? descripcion.trim() : null 
        });
        
        // Devolvemos la respuesta exacta con el ID recién insertado en MySQL
        res.status(201).json({ 
            id: resultado.insertId || resultado.id, 
            nombre: nombre.trim(), 
            descripcion: descripcion ? descripcion.trim() : "" 
        });
    } catch (error) {
        // Si hay un error de SQL o código, el middleware errorHandler lo captura sin tumbar el server
        console.error("❌ Error interno en POST /categorias:", error.message);
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