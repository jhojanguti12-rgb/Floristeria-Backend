const db = require('../config/db');

const proveedorService = {
    crearProveedor: (data) => {
        return new Promise((resolve, reject) => {
            const { nombre, contacto, telefono, direccion } = data;
            const query = 'INSERT INTO proveedores (nombre, contacto, telefono, direccion) VALUES (?, ?, ?, ?)';
            db.query(query, [nombre, contacto, telefono, direccion], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    getAllProveedores: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM proveedores ORDER BY nombre ASC';
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
};

module.exports = proveedorService;