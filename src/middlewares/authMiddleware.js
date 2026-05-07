const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en los headers
    const authHeader = req.header('Authorization');
    
    // Verificamos si existe el header y si empieza con 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ 
            mensaje: "🚫 Acceso denegado. No se encontró un token válido (formato Bearer esperado)." 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Verificamos el token
        const cifrado = jwt.verify(token, process.env.JWT_SECRET || 'llave_secreta_123');
        
        /**
         * 3. Guardamos los datos del usuario en el request.
         * IMPORTANTE: Asegúrate de que cuando generas el token en 'usuarioService.login',
         * incluyas el 'id', 'rol' y 'email' en el payload.
         */
        req.usuario = {
            id: cifrado.id,
            rol: cifrado.rol,   // <--- Esto es vital para la ruta /crear-personal
            email: cifrado.email
        };
        
        next(); 
    } catch (error) {
        console.error("❌ Error de JWT:", error.message);
        res.status(401).json({ mensaje: "❌ Token no válido, expirado o alterado." });
    }
};

module.exports = verificarToken;