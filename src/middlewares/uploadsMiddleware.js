const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ASEGURAR QUE LA CARPETA EXISTE: Para evitar errores en Render si la carpeta se borra
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Limpiamos el nombre original de espacios para evitar problemas en URLs
        const name = file.originalname.split(' ').join('_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + name);
    }
});

const fileFilter = (req, file, cb) => {
    // Aceptamos más mimetypes por si las moscas
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Solo se aceptan imágenes (jpg, png, webp).'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 1024 * 1024 * 10, // Aumentado a 10MB para mayor seguridad
        files: 1 // Solo una imagen por producto
    } 
});

const uploadWithErrorHandler = (req, res, next) => {
    const uploadSingle = upload.single('imagen');

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ mensaje: "La imagen es muy pesada. Máximo 10MB." });
            }
            return res.status(400).json({ mensaje: `Error de Multer: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ mensaje: err.message });
        }
        next();
    });
};

module.exports = { upload, uploadWithErrorHandler };