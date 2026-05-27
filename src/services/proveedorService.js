const db = require('../config/db');

const proveedorService = {
    // 1. Crear un nuevo proveedor
    crearProveedor: (data) => {
        return new Promise((resolve, reject) => {
            // Usamos las columnas reales de tu base de datos
            const { nombre, telefono, contacto_nombre } = data;
            const query = 'INSERT INTO proveedores (nombre, telefono, contacto_nombre) VALUES (?, ?, ?)';
            
            db.query(query, [nombre, telefono, contacto_nombre || ''], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    // 2. Obtener todos los proveedores
    getAllProveedores: () => {
        return new Promise((resolve, reject) => {
            // Los ordenamos por ID de forma descendente para que el último creado aparezca primero
            const query = 'SELECT * FROM proveedores ORDER BY id DESC';
            
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    },

    // 3. Actualizar un proveedor existente (NUEVO)
    actualizarProveedor: (id, data) => {
        return new Promise((resolve, reject) => {
            const { nombre, telefono, contacto_nombre } = data;
            const query = 'UPDATE proveedores SET nombre = ?, telefono = ?, contacto_nombre = ? WHERE id = ?';
            
            db.query(query, [nombre, telefono, contacto_nombre || '', id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    // 4. Eliminar un proveedor (NUEVO)
    eliminarProveedor: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM proveedores WHERE id = ?';
            
            db.query(query, [id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
};

module.exports = proveedorService;