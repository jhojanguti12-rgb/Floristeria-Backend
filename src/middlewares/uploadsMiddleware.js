const multer = require('multer');
const path = require('path');

// 1. Configuramos el "almacén" (dónde y con qué nombre se guardan)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Esta es la carpeta que ya tienes en la raíz según tu captura
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Nombre único para evitar que una imagen "Rosa.jpg" borre a otra "Rosa.jpg"
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Filtro de seguridad (Solo imágenes para proteger tu servidor)
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Enviamos un error claro si intentan subir un PDF o ejecutable
        cb(new Error('Formato no permitido. Solo se aceptan imágenes (jpg, png, webp).'), false);
    }
};

// 3. Creamos el cargador con límite de 5MB
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } 
});

// NUEVA FUNCIÓN: Middleware de manejo de errores específico para Multer
// Esto evita que el servidor se caiga si el archivo es muy pesado o el formato es incorrecto
const uploadWithErrorHandler = (req, res, next) => {
    // 'imagen' es el nombre que debe llevar el campo en el FormData del Frontend
    const uploadSingle = upload.single('imagen');

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Errores de Multer (ej. archivo muy grande)
            return res.status(400).json({ mensaje: `Error de carga: ${err.message}` });
        } else if (err) {
            // Errores de nuestro filtro de seguridad
            return res.status(400).json({ mensaje: err.message });
        }
        // Si todo va bien, pasamos al controlador
        next();
    });
};

module.exports = { upload, uploadWithErrorHandler };