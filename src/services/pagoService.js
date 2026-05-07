const db = require('../config/db');

const pagoService = {
    // Registra el pago vinculándolo al id_pedido
    crearPago: (pagoData) => {
        return new Promise((resolve, reject) => {
            const { id_pedido, metodo_pago, monto } = pagoData;
            const query = 'INSERT INTO pagos (id_pedido, metodo_pago, monto) VALUES (?, ?, ?)';
            
            db.query(query, [id_pedido, metodo_pago, monto], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    // Obtiene historial con nombres de clientes usando JOIN
    obtenerHistorialPagos: () => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT pa.id, pa.id_pedido, pa.metodo_pago, pa.monto, pa.fecha_pago, c.nombre AS cliente
                FROM pagos pa
                JOIN pedidos pe ON pa.id_pedido = pe.id
                JOIN clientes c ON pe.id_cliente = c.id
                ORDER BY pa.fecha_pago DESC`;
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
};

module.exports = pagoService;