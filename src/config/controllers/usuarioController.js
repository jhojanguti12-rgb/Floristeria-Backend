const usuarioService = require('../services/usuarioService');

const usuarioController = {
    // Registro de empleados/admin
    registro: async (req, res) => {
        try {
            // Validamos que vengan los datos mínimos
            const { nombre, email, password, rol } = req.body;
            if (!nombre || !email || !password) {
                return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
            }

            const resultado = await usuarioService.createUsuario(req.body);
            
            // Retornamos una respuesta estructurada
            res.status(201).json({ 
                mensaje: "¡Miembro del equipo registrado!", 
                id: resultado.insertId 
            });
        } catch (error) {
            // Si el error es por email duplicado (común en MySQL)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ mensaje: "Este correo ya está registrado en el jardín" });
            }
            res.status(500).json({ mensaje: "Error interno en el servidor", error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ mensaje: "Email y contraseña requeridos" });
            }

            const resultado = await usuarioService.login(email, password);
            res.json(resultado); 
        } catch (error) {
            // Error 401: No autorizado (credenciales mal)
            res.status(401).json({ mensaje: error.message });
        }
    }
};

module.exports = usuarioController;