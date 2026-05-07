const db = require('../config/db');

const flowerService = {
    // 1. Obtener todas las flores con su categoría
    getAllFlores: async () => {
        try {
            const query = `
                SELECT f.*, c.nombre AS nombre_categoria 
                FROM flores f
                LEFT JOIN categorias c ON f.id_categoria = c.id
                ORDER BY f.id DESC
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error("❌ Error en getAllFlores:", error.message);
            throw error;
        }
    },

    // 2. Crear una flor (Formato Promesa Puro)
    createFlower: async (flowerData) => {
        try {
            const { nombre, precio, stock, id_categoria, imagen_url, color } = flowerData;
            const query = `
                INSERT INTO flores (nombre, precio, stock, id_categoria, imagen_url, color) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            // Al usar db.query (que es pool.promise()), desestructuramos el primer elemento [result]
            const [result] = await db.query(query, [nombre, precio, stock, id_categoria, imagen_url, color]);
            return result;
        } catch (error) {
            console.error("❌ Error detallado en createFlower:", error.message);
            throw error;
        }
    },

    // 3. Actualizar datos (Corregido para compatibilidad total con el Pool)
    updateFlower: async (id, flowerData) => {
        try {
            // Usamos el formato SET ? que activamos con 'namedPlaceholders: true' en db.js
            const query = 'UPDATE flores SET ? WHERE id = ?';
            const [result] = await db.query(query, [flowerData, id]);
            return result;
        } catch (error) {
            console.error("❌ Error en updateFlower:", error.message);
            throw error;
        }
    },

    // 4. Eliminar una flor definitivamente
    deleteFlower: async (id) => {
        try {
            const query = 'DELETE FROM flores WHERE id = ?';
            const [result] = await db.query(query, [id]);
            return result;
        } catch (error) {
            console.error("❌ Error en deleteFlower:", error.message);
            throw error;
        }
    },

    // 5. Obtener lista de categorías
    getCategorias: async () => {
        try {
            const query = 'SELECT * FROM categorias ORDER BY nombre ASC';
            const [rows] = await db.query(query);
            // Aseguramos retornar un array vacío si no hay datos
            return rows || [];
        } catch (error) {
            console.error("❌ Error en getCategorias:", error.message);
            throw error;
        }
    }
};

module.exports = flowerService;