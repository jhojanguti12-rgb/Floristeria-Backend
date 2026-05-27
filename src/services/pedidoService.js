const db = require('../config/db');

const pedidoService = {
    // 1. Obtener todos los pedidos con nombres de clientes (Dashboard)
    getAllPedidos: async () => {
        try {
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

            return results.map(pedido => ({
                id: String(pedido.id),
                fecha: pedido.fecha,
                cliente: pedido.cliente, 
                nombre: pedido.cliente, 
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
        
        // Identificamos los campos que vienen del Admin Modal o del flujo Web
        const clienteNombre = data.cliente || 'Comprador Físico';
        const telefono = data.telefono_contacto || '';
        const direccion = data.direccion_entrega || 'Recoge en Tienda';
        const dedicatoriaTexto = data.dedicatoria || '';
        
        const id_cliente = data.id_cliente || null; 
        const id_empleado = data.id_empleado || null; 
        const total = data.total || 0;

        if (!listaProductos || listaProductos.length === 0) {
            throw new Error("El pedido no tiene productos seleccionados.");
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction(); 

            // 🌟 Consulta de inserción adaptada a tus columnas reales
            // Nota: Agregamos las columnas logísticas que lee tu panel de administración
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

            // Recorremos los productos para validar stock e insertar en detalle_pedido
            for (const p of listaProductos) {
                // Mapeo flexible: soporta 'id_flor' (Admin) o 'id_flor'/'id' (Web)
                const idFlor = p.id_flor || p.id;
                const cantidad = p.cantidad;
                // Mapeo flexible para el precio unitario
                const precioUnitario = p.precio_unitario || p.precio;

                const [rows] = await connection.query('SELECT stock, nombre FROM flores WHERE id = ?', [idFlor]);
                const flor = rows[0];

                if (!flor) {
                    throw new Error(`La flor con ID ${idFlor} no existe.`);
                }

                if (flor.stock < cantidad) {
                    throw new Error(`Stock insuficiente para: ${flor.nombre}. Disponible: ${flor.stock}, Solicitado: ${cantidad}`);
                }

                // 📌 Inserción en tu tabla original en singular: 'detalle_pedido'
                const queryDetalle = 'INSERT INTO detalle_pedido (id_pedido, id_flor, cantidad, precio_unitario) VALUES (?, ?, ?, ?)';
                await connection.query(queryDetalle, [nuevoPedidoId, idFlor, cantidad, precioUnitario]);

                // 💥 Restamos las unidades del inventario real
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

    // 3. Obtener lista de pedidos completa mapeada para el panel de administración
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
                    COALESCE(u.nombre, 'Comprador Físico / Web') AS cliente
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