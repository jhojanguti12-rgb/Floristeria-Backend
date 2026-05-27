const db = require('../config/db');

const categoriaService = {
    // 1. Obtener todas las categorías
    getAllCategorias: async () => {
        try {
            const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // 2. Crear categoría blindada ante campos nulos
    createCategoria: async (data) => {
        try {
            // Aseguramos que las propiedades existan antes de enviarlas al query
            const nombre = data.nombre || 'Nueva Colección';
            const descripcion = data.descripcion || ''; 

            const [result] = await db.query(
                'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', 
                [nombre, descripcion]
            );
            return result;
        } catch (error) {
            console.error("❌ Error directo en la consulta SQL de inserción:", error.message);
            throw error;
        }
    },

    // 3. Buscar flores de una categoría
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

    // 4. Actualizar una categoría
    updateCategoria: async (id, data) => {
        try {
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