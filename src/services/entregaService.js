const db = require('../config/db');

const entregaService = {
    crearEntrega: (entregaData) => {
        return new Promise((resolve, reject) => {
            const { id_pedido, direccion_entrega, fecha_entrega, estado } = entregaData;
            const query = 'INSERT INTO entregas (id_pedido, direccion_entrega, fecha_entrega, estado) VALUES (?, ?, ?, ?)';
            db.query(query, [id_pedido, direccion_entrega, fecha_entrega, estado || 'Pendiente'], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    actualizarEstado: (id, nuevoEstado) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE entregas SET estado = ? WHERE id = ?';
            db.query(query, [nuevoEstado, id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    listarEntregasProximas: () => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT e.*, c.nombre AS cliente, c.telefono 
                FROM entregas e
                JOIN pedidos p ON e.id_pedido = p.id
                JOIN clientes c ON p.id_cliente = c.id
                WHERE e.estado != 'Entregado'`;
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
};

module.exports = entregaService;