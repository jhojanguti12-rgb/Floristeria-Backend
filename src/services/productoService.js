const db = require('../config/db');

const productoService = {
    // Obtener todas las flores (tu catálogo)
    getAllFlores: async () => {
        const [rows] = await db.query('SELECT * FROM flores');
        return rows;
    },

    // 🌟 NUEVO: Actualizar todos los datos de una flor (Nombre, Categoría, Stock y Precio)
    updateFlor: async (id, datos) => {
        const { nombre, categoria, stock, precio } = datos;
        const query = 'UPDATE flores SET nombre = ?, categoria = ?, stock = ?, precio = ? WHERE id = ?';
        const [result] = await db.query(query, [nombre, categoria, stock, precio, id]);
        
        if (result.affectedRows === 0) {
            throw new Error('No se encontró ninguna flor con ese ID para actualizar');
        }
        return result;
    },

    // Actualizar únicamente el stock de una flor específica (Mantenido por compatibilidad)
    updateStockFlor: async (id, nuevoStock) => {
        const query = 'UPDATE flores SET stock = ? WHERE id = ?';
        const [result] = await db.query(query, [nuevoStock, id]);
        
        if (result.affectedRows === 0) {
            throw new Error('No se encontró ninguna flor con ese ID');
        }
        return result;
    },

    // Eliminar una flor de la base de datos por su ID
    deleteFlor: async (id) => {
        const query = 'DELETE FROM flores WHERE id = ?';
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            throw new Error('No se encontró ninguna flor con ese ID para eliminar');
        }
        return result;
    }
};

module.exports = productoService;