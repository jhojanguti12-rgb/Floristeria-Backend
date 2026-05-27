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

    // 2. CREAR CATEGORÍA CORREGIDO: Solo insertamos el 'nombre' ya que 'descripcion' no existe en tu tabla
    createCategoria: async (data) => {
        try {
            const nombre = data.nombre || 'Nueva Colección';

            // 🌟 QUITAMOS 'descripcion' DE LA CONSULTA SQL PARA EVITAR EL ERROR
            const [result] = await db.query(
                'INSERT INTO categorias (nombre) VALUES (?)', 
                [nombre]
            );
            return result;
        } catch (error) {
            console.error("❌ Error en la consulta SQL:", error.message);
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

// 🌟 4. Actualizar una categoría de forma segura usando su ID
    updateCategoria: async (id, nuevoNombre) => {
        try {
            // Actualizamos el nombre en la tabla 'categorias' basándonos estrictamente en su ID numérico
            const [result] = await db.query(
                'UPDATE categorias SET nombre = ? WHERE id = ?', 
                [nuevoNombre, id]
            );
            
            // Nota: Al estar vinculadas las tablas mediante id_categoria, 
            // el inventario leerá automáticamente el nuevo nombre modificado.
            return result;
        } catch (error) {
            console.error("❌ Error al actualizar categoría en Service:", error.message);
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