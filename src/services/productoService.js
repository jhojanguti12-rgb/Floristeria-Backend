const db = require('../config/db');

const productoService = {
    // Obtener todas las flores (tu catálogo)
    getAllFlores: async () => {
        const [rows] = await db.query('SELECT * FROM flores');
        return rows;
    },

    // Actualizar el stock de una flor específica
    updateStockFlor: async (id, nuevoStock) => {
        const query = 'UPDATE flores SET stock = ? WHERE id = ?';
        const [result] = await db.query(query, [nuevoStock, id]);
        
        if (result.affectedRows === 0) {
            throw new Error('No se encontró ninguna flor con ese ID');
        }
        return result;
    },

    // 🌟 NUEVO: Eliminar una flor de la base de datos por su ID
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