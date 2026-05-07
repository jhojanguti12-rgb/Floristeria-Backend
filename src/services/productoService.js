const db = require('../config/db');

const productoService = {
    // Obtener todas las flores (tu catálogo)
    getAllFlores: async () => {
        const [rows] = await db.query('SELECT * FROM flores');
        return rows;
    },

    // Actualizar el stock de una flor específica
    updateStockFlor: async (id, nuevoStock) => {
        // Nota: Asegúrate que en MySQL la columna se llame 'stock'
        const query = 'UPDATE flores SET stock = ? WHERE id = ?';
        const [result] = await db.query(query, [nuevoStock, id]);
        
        if (result.affectedRows === 0) {
            throw new Error('No se encontró ninguna flor con ese ID');
        }
        return result;
    }
};

module.exports = productoService;