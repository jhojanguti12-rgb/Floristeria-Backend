const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// 🚀 1. LA RUTA ESPECÍFICA DEL PARCIAL DEBE IR PRIMERO 
router.get('/stress-test', statsController.ejecutarParcialPerformance);

// 2. La ruta general del Dashboard va después
router.get('/', statsController.getResumen);

module.exports = router;