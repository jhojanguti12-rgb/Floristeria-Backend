const db = require('../config/db');

const pedidoService = {
    // 1. Obtener todos los pedidos con nombres de clientes
    getAllPedidos: async () => {
        try {
            const query = `
                SELECT p.id, p.fecha_pedido, c.nombre AS cliente, p.total 
                FROM pedidos p 
                JOIN clientes c ON p.id_cliente = c.id
                ORDER BY p.fecha_pedido DESC`;
            
            // Eliminamos .promise() porque el Pool en db.js ya lo incluye
            const [results] = await db.query(query); 
            return results;
        } catch (error) {
            console.error("❌ Error en getAllPedidos:", error.message);
            throw error;
        }
    },

    // 2. Crear pedido y DESCONTAR STOCK (Transacción completa)
    createPedido: async (data) => {
        const { id_cliente, id_empleado, total, productos } = data;

        if (!productos || productos.length === 0) {
            throw new Error("El pedido no tiene productos.");
        }

        // Usamos db directamente para obtener la conexión
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction(); // Zona segura

            // A. Insertar el pedido principal
            const queryPedido = 'INSERT INTO pedidos (id_cliente, id_empleado, total) VALUES (?, ?, ?)';
            const [resultPedido] = await connection.query(queryPedido, [id_cliente, id_empleado, total]);
            const nuevoPedidoId = resultPedido.insertId;

            // B. Procesar productos y actualizar inventario
            for (const p of productos) {
                // 1. Verificar stock actual antes de vender
                const [rows] = await connection.query('SELECT stock, nombre FROM flores WHERE id = ?', [p.id_flor]);
                const flor = rows[0];

                if (!flor) {
                    throw new Error(`La flor con ID ${p.id_flor} no existe.`);
                }

                if (flor.stock < p.cantidad) {
                    throw new Error(`Stock insuficiente para: ${flor.nombre}. Disponible: ${flor.stock}, Solicitado: ${p.cantidad}`);
                }

                // 2. Insertar en detalle_pedido
                const queryDetalle = 'INSERT INTO detalle_pedido (id_pedido, id_flor, cantidad, precio_unitario) VALUES (?, ?, ?, ?)';
                await connection.query(queryDetalle, [nuevoPedidoId, p.id_flor, p.cantidad, p.precio_unitario]);

                // 3. DESCONTAR STOCK (Tu lógica central para que baje a 8)
                const queryUpdateStock = 'UPDATE flores SET stock = stock - ? WHERE id = ?';
                await connection.query(queryUpdateStock, [p.cantidad, p.id_flor]);
            }

            await connection.commit(); // Éxito total
            return { 
                id: nuevoPedidoId, 
                mensaje: "✅ Venta exitosa e inventario actualizado." 
            };

        } catch (error) {
            await connection.rollback(); // Si algo falla (como el ECONNRESET), deshacemos todo
            console.error("❌ Error en la transacción de pedido:", error.message);
            throw error;
        } finally {
            connection.release(); // LIBERAR la conexión SIEMPRE
        }
    }
};

module.exports = pedidoService;