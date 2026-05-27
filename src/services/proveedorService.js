const db = require('../config/db');

const proveedorService = {
    // 1. Obtener todos los proveedores
    getAllProveedores: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM proveedores ORDER BY id DESC';
            db.query(query, (err, results) => {
                if (err) {
                    console.error("❌ Error en getAllProveedores:", err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    // 2. Crear un nuevo proveedor
    createProveedor: (data) => {
        return new Promise((resolve, reject) => {
            // Desestructuramos las variables asegurando que coincidan con el Form de React
            const { nombre, telefono, contacto_nombre } = data;
            
            const query = 'INSERT INTO proveedores (nombre, telefono, contacto_nombre) VALUES (?, ?, ?)';
            
            // 💡 Agregamos "|| ''" por si el asesor viene vacío, así MySQL no se rompe si no acepta NULL
            db.query(query, [nombre, telefono, contacto_nombre || ''], (err, result) => {
                if (err) {
                    console.error("❌ Error al insertar en la tabla proveedores:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    // 3. Actualizar un proveedor existente
    actualizarProveedor: (id, data) => {
        return new Promise((resolve, reject) => {
            const { nombre, telefono, contacto_nombre } = data;
            const query = 'UPDATE proveedores SET nombre = ?, telefono = ?, contacto_nombre = ? WHERE id = ?';
            
            db.query(query, [nombre, telefono, contacto_nombre || '', id], (err, result) => {
                if (err) {
                    console.error("❌ Error en actualizarProveedor:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    // 4. Eliminar un proveedor
    eliminarProveedor: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM proveedores WHERE id = ?';
            db.query(query, [id], (err, result) => {
                if (err) {
                    console.error("❌ Error en eliminarProveedor:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
};

module.exports = proveedorService;