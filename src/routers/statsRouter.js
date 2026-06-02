const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// 1. Ruta comercial del Dashboard (/api/stats)
router.get('/', statsController.getResumen);

// 🚀 2. NUEVA RUTA PARA EL EXAMEN PARCIAL (/api/stats/stress-test)
router.get('/stress-test', statsController.ejecutarParcialPerformance);

module.exports = router;