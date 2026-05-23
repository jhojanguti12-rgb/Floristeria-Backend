const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. CONEXIÓN SEGURA CON CLOUDINARY (Usa tus variables de entorno del .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkvxkljkl',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. CONFIGURACIÓN DEL ALMACENAMIENTO EN LA NUBE
// Reemplaza a 'multer.diskStorage' manteniendo la limpieza de nombres que tenías
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'floristeria_inventario', // Carpeta automática en tu cuenta de Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'], // Mantenemos tus formatos permitidos
        public_id: (req, file) => {
            // Limpiamos el nombre de espacios justo como lo hacías originalmente
            const name = file.originalname.split('.')[0].split(' ').join('_');
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return uniqueSuffix + '-' + name;
        }
    }
});

// 3. TU FILTRO DE ARCHIVOS ORIGINAL (Se conserva intacto)
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Solo se aceptan imágenes (jpg, png, webp).'), false);
    }
};

// 4. TU CONFIGURACIÓN DE LÍMITES ORIGINAL (Se conserva intacta)
const upload = multer({ 
    storage: storage, // Ahora apunta a Cloudinary
    fileFilter: fileFilter,
    limits: { 
        fileSize: 1024 * 1024 * 10, // Mantenemos tus 10MB máximos de seguridad
        files: 1 // Solo una imagen por producto
    } 
});

// 5. TU MANEJADOR DE ERRORES ORIGINAL (Se conserva exactamente igual)
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

// Exportamos exactamente lo mismo para que tus otros archivos no se rompan
module.exports = { upload, uploadWithErrorHandler };