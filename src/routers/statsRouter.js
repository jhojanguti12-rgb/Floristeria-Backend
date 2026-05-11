const express = require('express');
const router = express.Router();
// RUTA CORREGIDA:
const statsController = require('../controllers/statsController');

router.get('/resumen', statsController.getResumen);

module.exports = router;