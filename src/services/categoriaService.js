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

    // 🌟 4. Actualizar una categoría y sincronizar el Inventario (MODIFICADO)
    updateCategoria: async (id, nuevoNombre) => {
        try {
            // A. Consultamos el nombre antiguo de la categoría antes de cambiarlo
            const [rows] = await db.query('SELECT nombre FROM categorias WHERE id = ?', [id]);
            
            if (!rows || rows.length === 0) {
                throw new Error("La categoría que intentas editar no existe.");
            }
            const nombreAntiguo = rows[0].nombre;

            // B. Actualizamos el nombre en la tabla original de 'categorias'
            const [result] = await db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nuevoNombre, id]);

            // C. ¡La Magia! Sincronizamos las flores antiguas que guardaron el nombre como texto plano
            // Esto evitará que se dupliquen o queden huérfanas las pestañas del inventario
            await db.query('UPDATE flores SET categoria = ? WHERE categoria = ?', [nuevoNombre, nombreAntiguo]);

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