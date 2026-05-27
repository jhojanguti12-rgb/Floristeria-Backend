const db = require('../config/db');

const proveedorService = {
    // 1. Obtener todos los proveedores
    getAllProveedores: () => {
        return new Promise((resolve, reject) => {
            // Aseguramos 'proveedores' en minúscula exacta
            const query = 'SELECT id, nombre, telefono, contacto_nombre FROM proveedores ORDER BY id DESC';
            
            db.query(query, (err, results) => {
                if (err) {
                    console.error("❌ Error interno MySQL en getAllProveedores:", err.message);
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    // 2. Crear un nuevo proveedor
    createProveedor: (data) => {
        return new Promise((resolve, reject) => {
            // Desestructuración segura protegiendo nulos o vacíos
            const nombre = data && data.nombre ? data.nombre.toString().trim() : '';
            const telefono = data && data.telefono ? data.telefono.toString().trim() : '';
            const contacto_nombre = data && data.contacto_nombre ? data.contacto_nombre.toString().trim() : '';

            // Columnas exactas de tu Workbench en minúsculas
            const query = 'INSERT INTO proveedores (nombre, telefono, contacto_nombre) VALUES (?, ?, ?)';
            
            db.query(query, [nombre, telefono, contacto_nombre], (err, result) => {
                if (err) {
                    console.error("❌ Error interno MySQL en createProveedor:", err.message);
                    return reject(err);
                }
                resolve(result);
            });
        });
    },

    // 3. Actualizar un proveedor existente
    actualizarProveedor: (id, data) => {
        return new Promise((resolve, reject) => {
            const nombre = data && data.nombre ? data.nombre.toString().trim() : '';
            const telefono = data && data.telefono ? data.telefono.toString().trim() : '';
            const contacto_nombre = data && data.contacto_nombre ? data.contacto_nombre.toString().trim() : '';

            const query = 'UPDATE proveedores SET nombre = ?, telefono = ?, contacto_nombre = ? WHERE id = ?';
            
            db.query(query, [nombre, telefono, contacto_nombre, Number(id)], (err, result) => {
                if (err) {
                    console.error("❌ Error interno MySQL en actualizarProveedor:", err.message);
                    return reject(err);
                }
                resolve(result);
            });
        });
    },

    // 4. Eliminar un proveedor
    eliminarProveedor: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM proveedores WHERE id = ?';
            
            db.query(query, [Number(id)], (err, result) => {
                if (err) {
                    console.error("❌ Error interno MySQL en eliminarProveedor:", err.message);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }
};

module.exports = proveedorService;