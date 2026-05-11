const express = require('express');
const router = express.Router();
// IMPORTANTE: La 'C' debe coincidir exactamente con el nombre de tu archivo
const statsController = require('../controllers/statsController'); 

// Esta ruta llama al controlador, que a su vez llama al servicio
router.get('/resumen', statsController.getResumen);

module.exports = router;