const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usuarioService = {
    
    /**
     * 1. Buscar usuario por email
     * Crucial para el login y para evitar duplicados en el registro.
     */
    getUsuarioByEmail: async (email) => {
        try {
            const query = 'SELECT * FROM usuarios WHERE email = ?';
            const [results] = await db.query(query, [email]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error("❌ Error en getUsuarioByEmail:", error.message);
            throw error;
        }
    },

    /**
     * 2. Crear usuarios (Personal o Clientes)
     * Proceso: Valida duplicado -> Encripta Contraseña -> Guarda en MySQL.
     */
    createUsuario: async (userData) => {
        const { nombre, email, password, rol } = userData;

        try {
            // Validación de email duplicado antes de intentar insertar
            const usuarioExistente = await usuarioService.getUsuarioByEmail(email);
            if (usuarioExistente) {
                const err = new Error('El correo electrónico ya está registrado');
                err.code = 'ER_DUP_ENTRY'; 
                throw err;
            }

            // SEGURIDAD: Encriptación con Bcrypt
            console.log(`🔐 Encriptando acceso para ${email}...`);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Rol por defecto si no se especifica
            const rolFinal = rol || 'empleado';

            const query = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
            const [res] = await db.query(query, [nombre, email, hashedPassword, rolFinal]);
            
            console.log(`✅ Usuario (${rolFinal}) guardado en la parcela de MySQL`);
            return res;
        } catch (error) {
            console.error("❌ Error en createUsuario:", error.message);
            throw error;
        }
    },

    /**
     * 3. Login optimizado
     * Genera el Token JWT necesario para navegar por el panel.
     */
    login: async (email, password) => {
        try {
            console.log("🔍 Verificando identidad en el jardín:", email);
            
            const usuario = await usuarioService.getUsuarioByEmail(email);

            if (!usuario) {
                throw new Error('El correo no coincide con nuestros registros');
            }

            // Verificación de contraseña encriptada
            const validPassword = await bcrypt.compare(password, usuario.password);
            if (!validPassword) {
                throw new Error('La contraseña es incorrecta');
            }

            // Firma del Token JWT
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email, 
                    rol: usuario.rol 
                },
                process.env.JWT_SECRET || 'llave_secreta_123',
                { expiresIn: '24h' }
            );

            // Respuesta para el Frontend
            return { 
                token, 
                rol: usuario.rol,
                nombre: usuario.nombre,
                email: usuario.email
            };
        } catch (error) {
            throw error;
        }
    }, 

    /**
     * 🌟 4. Obtener todo el personal (Admin Panel) - ¡CORREGIDO!
     * Filtra la base de datos para traer únicamente administradores y empleados,
     * excluyendo explícitamente a los clientes para no contaminar el equipo de trabajo.
     */
    getAllPersonal: async () => {
        try {
            // Agregamos el filtro WHERE para excluir cuentas con rol de cliente
            const query = "SELECT id, nombre, email, rol FROM usuarios WHERE rol != 'cliente' ORDER BY id ASC";
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error("❌ Error en getAllPersonal:", error.message);
            throw error;
        }
    },

    /**
     * 🌟 5. Eliminar un usuario del personal por ID
     */
    deletePersonal: async (id) => {
        try {
            const query = 'DELETE FROM usuarios WHERE id = ?';
            const [result] = await db.query(query, [id]);
            return result;
        } catch (error) {
            console.error("❌ Error en deletePersonal:", error.message);
            throw error;
        }
    }
}; 

module.exports = usuarioService;