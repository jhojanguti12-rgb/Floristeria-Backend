const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Cambiamos '/resumen' por '/' para que responda en /api/stats
router.get('/', statsController.getResumen);

module.exports = router;