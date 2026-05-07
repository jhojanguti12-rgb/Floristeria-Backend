const db = require('../config/db');

const clienteService = {
    // 1. Obtener todos los clientes (Este estaba bien)
    getAllClientes: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM clientes', (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    // 2. REGISTRO CORREGIDO: Ajustado a tus columnas reales
    createCliente: (clienteData) => {
        return new Promise((resolve, reject) => {
            // Sacamos solo los campos que SI existen en tu tabla
            const { nombre, telefono, correo } = clienteData; 
            
            // La consulta debe usar 'correo', no 'email'
            const query = 'INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)';
            
            db.query(query, [nombre, telefono, correo], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    }
};
// Para verificar si el cliente existe antes de hacer un pedido
    getClienteById: (id) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM clientes WHERE id = ?', [id], (err, results) => {
                if (err) reject(err);
                resolve(results.length > 0 ? results[0] : null);
            });
        });
    }
module.exports = clienteService;