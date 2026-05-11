const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Solo una línea limpia que llama al controlador
router.get('/resumen', statsController.getResumen);

module.exports = router;