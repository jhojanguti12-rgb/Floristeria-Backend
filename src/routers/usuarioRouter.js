const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuarioService');
const verificarToken = require('../middlewares/authMiddleware');

// 1. Ruta para REGISTRAR (Temporalmente permite cualquier rol para crear el primer Admin)
router.post('/registro', async (req, res) => {
    console.log("📩 Solicitud de REGISTRO recibida para:", req.body?.email);
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "No se enviaron datos" });
        }

        const { email, password, nombre } = req.body;
        if (!email || !password || !nombre) {
            return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
        }

        // --- CAMBIO EN LÍNEA 17 ---
        // Quitamos el forzado de 'cliente' para poder crear el Admin inicial desde Postman
        const datosUsuario = { ...req.body }; 
        
        const resultado = await usuarioService.createUsuario(datosUsuario);
        
        return res.status(201).json({ 
            mensaje: "✅ Usuario registrado correctamente", 
            id: resultado.insertId 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "El correo electrónico ya existe." });
        }
        return res.status(500).json({ error: "Error en el registro", detalle: error.message });
    }
});

// 2. Ruta para que el ADMIN cree PERSONAL (Protegida)
router.post('/crear-personal', verificarToken, async (req, res) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden crear personal." });
    }

    console.log("👑 Admin creando nuevo usuario:", req.body?.email, "con rol:", req.body?.rol);
    
    try {
        const { email, password, rol, nombre } = req.body;

        if (!email || !password || !rol || !nombre) {
            return res.status(400).json({ error: "Todos los campos son obligatorios (incluyendo el rol)" });
        }

        const resultado = await usuarioService.createUsuario(req.body);
        
        return res.status(201).json({ 
            mensaje: `✅ ${rol} creado con éxito por el administrador`, 
            id: resultado.insertId 
        });
    } catch (error) {
        console.error("❌ Error al crear personal:", error.message);
        return res.status(500).json({ error: "No se pudo crear el usuario", detalle: error.message });
    }
});

// 3. Ruta para LOGIN
router.post('/login', async (req, res) => {
    console.log("🔑 Solicitud de LOGIN recibida para:", req.body?.email);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Debes proporcionar email y contraseña" });
        }
        
        const resultado = await usuarioService.login(email, password);
        
        return res.status(200).json({ 
            mensaje: "🔑 ¡Bienvenido!", 
            ...resultado 
        });
    } catch (error) {
        return res.status(401).json({ error: error.message || "Credenciales incorrectas" });
    }
});

router.get('/perfil', (req, res) => {
    res.json({ mensaje: "El router de usuarios está respondiendo correctamente" });
});

module.exports = router;