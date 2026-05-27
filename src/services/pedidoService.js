const db = require('../config/db');

const pedidoService = {
// 1. Obtener todos los pedidos con nombres de clientes (Dashboard) - CORREGIDO
    getAllPedidos: async () => {
        try {
            const query = `
                SELECT 
                    p.id, 
                    p.fecha_pedido as fecha, 
                    p.direccion_entrega,
                    CASE 
                        WHEN p.id_cliente = 1 AND p.direccion_entrega LIKE 'Cliente: %' 
                            THEN SUBSTRING_INDEX(SUBSTRING_INDEX(p.direccion_entrega, ' | ', 1), 'Cliente: ', -1)
                        WHEN p.id_cliente = 1 AND (p.direccion_entrega NOT LIKE 'Cliente: %' OR p.direccion_entrega IS NULL)
                            THEN 'Comprador Físico'
                        ELSE COALESCE(u.nombre, 'Cliente Registrado')
                    END AS cliente, 
                    p.total 
                FROM pedidos p 
                LEFT JOIN usuarios u ON p.id_cliente = u.id
                ORDER BY p.id DESC LIMIT 10`;
            
            const [results] = await db.query(query); 

            return results.map(pedido => ({
                id: String(pedido.id),
                fecha: pedido.fecha,
                cliente: pedido.cliente, 
                nombre: pedido.cliente, // Esto garantiza que el componente del Dashboard lea 'nombre' correctamente
                total: Number(pedido.total),
                status: 'completado' 
            }));

        } catch (error) {
            console.error("❌ Error en getAllPedidos:", error.message);
            throw error;
        }
    },

    // 2. CREAR PEDIDO Y DESCONTAR STOCK (Unificado para Web y Panel de Administración)
    createPedido: async (data) => {
        // Adaptamos para recibir 'productos' (Web) o 'flores' (Modal de Admin)
        const listaProductos = data.productos || data.flores;
        
        const telefono = data.telefono_contacto || '';
        const direccion = data.direccion_entrega || 'Recoge en Tienda';
        const dedicatoriaTexto = data.dedicatoria || '';
        
        // Forzamos el ID 1 verificado en MySQL Workbench
        const id_cliente = data.id_cliente || 1; 
        const id_empleado = data.id_empleado || null; 
        const total = data.total || 0;

        if (!listaProductos || listaProductos.length === 0) {
            throw new Error("El pedido no tiene productos seleccionados.");
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction(); 

            const queryPedido = `
                INSERT INTO pedidos 
                (id_cliente, id_empleado, total, estado, direccion_entrega, telefono_contacto, dedicatoria, fecha_pedido) 
                VALUES (?, ?, ?, 'Pendiente', ?, ?, ?, NOW())
            `;
            
            const [resultPedido] = await connection.query(queryPedido, [
                id_cliente, 
                id_empleado, 
                total,
                direccion,
                telefono,
                dedicatoriaTexto
            ]);
            
            const nuevoPedidoId = resultPedido.insertId;

            for (const p of listaProductos) {
                const idFlor = p.id_flor || p.id;
                const cantidad = p.cantidad;
                const precioUnitario = p.precio_unitario || p.precio;

                const [rows] = await connection.query('SELECT stock, nombre FROM flores WHERE id = ?', [idFlor]);
                const flor = rows[0];

                if (!flor) {
                    throw new Error(`La flor con ID ${idFlor} no existe.`);
                }

                if (flor.stock < cantidad) {
                    throw new Error(`Stock insuficiente para: ${flor.nombre}. Disponible: ${flor.stock}, Solicitado: ${cantidad}`);
                }

                const queryDetalle = 'INSERT INTO detalle_pedido (id_pedido, id_flor, cantidad, precio_unitario) VALUES (?, ?, ?, ?)';
                await connection.query(queryDetalle, [nuevoPedidoId, idFlor, cantidad, precioUnitario]);

                const queryUpdateStock = 'UPDATE flores SET stock = stock - ? WHERE id = ?';
                await connection.query(queryUpdateStock, [cantidad, idFlor]);
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
    },

    // =========================================================
    // 🌟 FUNCIONES EXCLUSIVAS PARA EL ADMIN PANEL (PEDIDOS)
    // =========================================================

    // 3. Obtener lista de pedidos completa mapeada para el panel de administración (¡RESTABLECIDA!)
    getAdminPedidosLista: async () => {
        try {
            const query = `
                SELECT 
                    p.id, 
                    p.total, 
                    p.estado, 
                    p.fecha_pedido AS fecha,
                    p.direccion_entrega, 
                    p.telefono_contacto, 
                    p.dedicatoria,
                    CASE 
                        WHEN p.id_cliente = 1 AND p.direccion_entrega LIKE 'Cliente: %' 
                            THEN SUBSTRING_INDEX(SUBSTRING_INDEX(p.direccion_entrega, ' | ', 1), 'Cliente: ', -1)
                        WHEN p.id_cliente = 1 
                            THEN 'Comprador Físico'
                        ELSE COALESCE(u.nombre, 'Comprador Web')
                    END AS cliente
                FROM pedidos p
                LEFT JOIN usuarios u ON p.id_cliente = u.id
                ORDER BY p.id DESC`;

            const [results] = await db.query(query);
            return results;
        } catch (error) {
            console.error("❌ Error en getAdminPedidosLista:", error.message);
            throw error;
        }
    },

    // 4. Obtener el desglose de arreglos florales de un pedido en base a su ID
    getAdminPedidoDetalle: async (id_pedido) => {
        try {
            const query = `
                SELECT 
                    dp.cantidad, 
                    dp.precio_unitario AS precio, 
                    f.nombre
                FROM detalle_pedido dp
                JOIN flores f ON dp.id_flor = f.id
                WHERE dp.id_pedido = ?`;

            const [results] = await db.query(query, [id_pedido]);
            return results;
        } catch (error) {
            console.error("❌ Error en getAdminPedidoDetalle:", error.message);
            throw error;
        }
    },

    // 5. Actualizar el estado logístico de un pedido (Pendiente, En Preparacion, etc.)
    updatePedidoEstado: async (id, estado) => {
        try {
            const query = 'UPDATE pedidos SET estado = ? WHERE id = ?';
            await db.query(query, [estado, id]);
            return { mensaje: "✅ Estado de la orden modificado exitosamente." };
        } catch (error) {
            console.error("❌ Error en updatePedidoEstado:", error.message);
            throw error;
        }
    }
};

module.exports = pedidoService;