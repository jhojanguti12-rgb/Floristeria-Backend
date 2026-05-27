const db = require('../config/db');

const proveedorService = {
    // 1. Obtener todos los proveedores
    getAllProveedores: async () => {
        try {
            // Con mysql2/promise se usa desestructuración [rows] para obtener los resultados
            const [rows] = await db.query('SELECT id, nombre, telefono, contacto_nombre FROM proveedores ORDER BY id DESC');
            return rows;
        } catch (error) {
            console.error("❌ Error en proveedorService.getAllProveedores:", error.message);
            throw error; // Lanza el error para que lo ataje el catch del Router
        }
    },

    // 2. Crear un nuevo proveedor
    createProveedor: async (data) => {
        try {
            const nombre = data && data.nombre ? data.nombre.toString().trim() : '';
            const telefono = data && data.telefono ? data.telefono.toString().trim() : '';
            const contacto_nombre = data && data.contacto_nombre ? data.contacto_nombre.toString().trim() : '';

            const query = 'INSERT INTO proveedores (nombre, telefono, contacto_nombre) VALUES (?, ?, ?)';
            const [result] = await db.query(query, [nombre, telefono, contacto_nombre]);
            
            return result;
        } catch (error) {
            console.error("❌ Error en proveedorService.createProveedor:", error.message);
            throw error;
        }
    },

    // 3. Actualizar un proveedor existente
    actualizarProveedor: async (id, data) => {
        try {
            const nombre = data && data.nombre ? data.nombre.toString().trim() : '';
            const telefono = data && data.telefono ? data.telefono.toString().trim() : '';
            const contacto_nombre = data && data.contacto_nombre ? data.contacto_nombre.toString().trim() : '';

            const query = 'UPDATE proveedores SET nombre = ?, telefono = ?, contacto_nombre = ? WHERE id = ?';
            const [result] = await db.query(query, [nombre, telefono, contacto_nombre, Number(id)]);
            
            return result;
        } catch (error) {
            console.error("❌ Error en proveedorService.actualizarProveedor:", error.message);
            throw error;
        }
    },

    // 4. Eliminar un proveedor
    eliminarProveedor: async (id) => {
        try {
            const query = 'DELETE FROM proveedores WHERE id = ?';
            const [result] = await db.query(query, [Number(id)]);
            
            return result;
        } catch (error) {
            console.error("❌ Error en proveedorService.eliminarProveedor:", error.message);
            throw error;
        }
    }
};

module.exports = proveedorService;