const db = require('../config/db');

const categoriaService = {
    // 1. Obtener todas las categorías (Para el selector del formulario)
    getAllCategorias: async () => {
        try {
            // Al usar promise clients, usamos await y desestructuramos [rows]
            const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // 2. Para que el Admin añada categorías
    createCategoria: async (data) => {
        try {
            const { nombre, descripcion } = data;
            const [result] = await db.query(
                'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', 
                [nombre, descripcion]
            );
            return result;
        } catch (error) {
            throw error;
        }
    },

    // 3. LA UNIÓN: Buscar flores de una categoría específica
    getFloresByCategoria: async (idCategoria) => {
        try {
            const [rows] = await db.query(
                'SELECT id, nombre, precio, stock FROM flores WHERE id_categoria = ?',
                [idCategoria]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // 4. Actualizar una categoría (Nombre o descripción)
    updateCategoria: async (id, data) => {
        try {
            // Usamos SET ? para que mysql2 maneje el objeto de datos automáticamente
            const [result] = await db.query('UPDATE categorias SET ? WHERE id = ?', [data, id]);
            return result;
        } catch (error) {
            throw error;
        }
    },

    // 5. Eliminar una categoría
    deleteCategoria: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = categoriaService;