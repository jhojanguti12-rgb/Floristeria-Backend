const db = require('../config/db');

const pedidoService = {
    // 1. Obtener todos los pedidos con nombres de clientes
    getAllPedidos: async () => {
        try {
            // USAMOS LEFT JOIN y COALESCE para asegurar que el nombre siempre llegue
            // Cambiamos p.fecha_pedido a p.fecha_pedido AS fecha para compatibilidad
            const query = `
                SELECT 
                    p.id, 
                    p.fecha_pedido as fecha, 
                    COALESCE(c.nombre, 'Cliente Registrado') AS cliente, 
                    p.total 
                FROM pedidos p 
                LEFT JOIN clientes c ON p.id_cliente = c.id
                ORDER BY p.id DESC LIMIT 10`;
            
            const [results] = await db.query(query); 

            // Formateamos los resultados para que el Frontend los lea perfecto
            return results.map(pedido => ({
                ...pedido,
                id: String(pedido.id),
                nombre: pedido.cliente, // Duplicamos por si el frontend busca 'nombre'
                total: Number(pedido.total).toFixed(2),
                status: 'pendiente' // Valor por defecto para los badges de colores
            }));

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

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction(); 

            const queryPedido = 'INSERT INTO pedidos (id_cliente, id_empleado, total) VALUES (?, ?, ?)';
            const [resultPedido] = await connection.query(queryPedido, [id_cliente, id_empleado, total]);
            const nuevoPedidoId = resultPedido.insertId;

            for (const p of productos) {
                const [rows] = await connection.query('SELECT stock, nombre FROM flores WHERE id = ?', [p.id_flor]);
                const flor = rows[0];

                if (!flor) {
                    throw new Error(`La flor con ID ${p.id_flor} no existe.`);
                }

                if (flor.stock < p.cantidad) {
                    throw new Error(`Stock insuficiente para: ${flor.nombre}. Disponible: ${flor.stock}, Solicitado: ${p.cantidad}`);
                }

                const queryDetalle = 'INSERT INTO detalle_pedido (id_pedido, id_flor, cantidad, precio_unitario) VALUES (?, ?, ?, ?)';
                await connection.query(queryDetalle, [nuevoPedidoId, p.id_flor, p.cantidad, p.precio_unitario]);

                const queryUpdateStock = 'UPDATE flores SET stock = stock - ? WHERE id = ?';
                await connection.query(queryUpdateStock, [p.cantidad, p.id_flor]);
            }

            await connection.commit(); 
            return { 
                id: nuevoPedidoId, 
                mensaje: "✅ Venta exitosa e inventario actualizado." 
            };

        } catch (error) {
            await connection.rollback(); 
            console.error("❌ Error en la transacción de pedido:", error.message);
            throw error;
        } finally {
            connection.release(); 
        }
    }
};

module.exports = pedidoService;