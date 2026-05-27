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


// 2. Ruta para añadir una categoría (POST /api/categorias) - EDICIÓN CORREGIDA
router.post('/', async (req, res, next) => {
    try {
        // 1. Extraemos los campos directamente asegurándonos de que existan
        const nombre = req.body && req.body.nombre ? req.body.nombre.toString().trim() : '';
        const descripcion = req.body && req.body.descripcion ? req.body.descripcion.toString().trim() : '';

        // 2. Validación estricta en el Backend antes de enviar a MySQL
        if (!nombre) {
            return res.status(400).json({ error: "El nombre de la categoría es obligatorio." });
        }

        // 3. Enviamos los datos limpios al servicio
        const resultado = await categoriaService.createCategoria({ nombre, descripcion });
        
        // 4. Extraemos el ID generado en la base de datos (mysql2 lo guarda en insertId)
        const nuevoId = resultado && resultado.insertId ? resultado.insertId : Date.now();

        // 5. Devolvemos la respuesta exacta construyendo el objeto estructurado que React necesita
        return res.status(201).json({ 
            id: nuevoId, 
            nombre: nombre, 
            descripcion: descripcion || "" 
        });

    } catch (error) {
        console.error("❌ Error real en POST /api/categorias:", error);
        // Pasamos el error al manejador global para evitar que se caiga el servidor
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