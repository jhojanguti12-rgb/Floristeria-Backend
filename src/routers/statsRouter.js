const express = require('express');
const router = express.Router();
const multer = require('multer');
const statsController = require('../controllers/statsController');

// Configurar multer para almacenar temporalmente el archivo en memoria RAM
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Definir la ruta que recibirá el archivo Excel
// Al usar upload.single('file'), le decimos que busque el archivo que React mandó bajo el nombre 'file'
router.post('/stress-test', upload.single('file'), statsController.stressTestExcel);

module.exports = router;