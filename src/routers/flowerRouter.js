const express = require('express');
const router = express.Router();
const flowerService = require('../services/flowerService');
const { uploadWithErrorHandler } = require('../middlewares/uploadsMiddleware'); 
const verificarToken = require('../middlewares/authMiddleware');

// =========================================================================
// 1. OBTENER TODAS LAS FLORES
// =========================================================================
router.get('/', async (req, res, next) => {
    try {
        const flores = await flowerService.getAllFlores();
        res.json(flores);
    } catch (error) {
        next(error);
    }
});

// =========================================================================
// 🚀 PARCIAL: IMPORTACIÓN MASIVA DESDE EXCEL (RF-01, RF-02)
// POST /api/flores/importar-excel
// =========================================================================
const xlsx = require('xlsx');
const multer = require('multer');
const uploadExcel = multer({ dest: 'uploads/' }); // Carpeta temporal para procesar el Excel

router.post('/importar-excel', verificarToken, uploadExcel.single('excelFile'), async (req, res, next) => {
    const db = require('../config/db');
    const connection = await db.getConnection(); // Pool de conexiones para máxima velocidad
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Por favor, selecciona un archivo Excel (.xlsx).' });
        }

        // 1. Leer el archivo Excel cargado en el servidor
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0]; // Tomamos la primera hoja
        const sheet = workbook.Sheets[sheetName];
        
        // Convertimos las filas del Excel automáticamente en un Array de objetos JSON
        const filasFlores = xlsx.utils.sheet_to_json(sheet);

        console.log(`📊 Iniciando carga masiva: Procesando ${filasFlores.length} flores desde Excel...`);

        // 2. Iniciamos una transacción SQL para insertar los 1050 registros de un solo golpe (Anti-caídas)
        await connection.beginTransaction();

        const query = 'INSERT INTO flores (nombre, precio, stock, id_categoria, color, imagen_url) VALUES (?, ?, ?, ?, ?, ?)';
        const fotoDefecto = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600';

        // Recorremos el Excel fila por fila
        for (const fila of filasFlores) {
            const nombre = fila.Nombre || 'Flor Importada';
            const precio = parseFloat(fila.Precio) || 0;
            const stock = parseInt(fila.Stock) || 0;
            const id_categoria = parseInt(fila.CategoriaID) || 11; // Usamos la categoría 11 (flores ornamentales) de tu DB
            const color = fila.Color || 'Surtido';

            // Ejecutamos el insert fila por fila dentro de la transacción dedicada
            await connection.query(query, [nombre, precio, stock, id_categoria, color, fotoDefecto]);
        }

        // Confirmamos y guardamos todo en Aiven MySQL
        await connection.commit();
        console.log(`✅ Carga masiva exitosa. Se insertaron ${filasFlores.length} registros.`);

        // --- REQUERIMIENTO RF-02: Consulta automática de Conteo Total ---
        const [rowsCount] = await connection.query('SELECT COUNT(*) AS total FROM flores');
        const totalActualBaseDatos = rowsCount[0].total;

        return res.status(200).json({
            parcial_db: "Resultados de Carga Masiva - RF-01 y RF-02",
            estado: "Completado con éxito",
            registros_insertados_excel: filasFlores.length,
            rf_02_total_filas_inventario: totalActualBaseDatos,
            mensaje: `Se han inyectado correctamente las ${filasFlores.length} flores en Aiven. El inventario total es ahora de ${totalActualBaseDatos} productos.`
        });

    } catch (error) {
        // Si el Excel viene corrupto o la DB falla, revertimos para no dañar nada
        await connection.rollback();
        console.error("❌ Error crítico en la importación por Excel:", error.message);
        next(error);
    } finally {
        connection.release(); // Obligatorio liberar la conexión de vuelta al pool
    }
});

// =========================================================================
// 2. CREAR UNA FLOR (CON FOTO INDIVIDUAL)
// =========================================================================
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
            id_categoria: categoriaId, 
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

// =========================================================================
// 3. ELIMINAR UNA FLOR PERMANENTEMENTE DE LA BASE DE DATOS
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

module.exports = router;