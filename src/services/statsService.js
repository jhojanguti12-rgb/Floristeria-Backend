const db = require('../config/db');

const getTotals = async () => {
    // IMPORTANTE: Asegúrate de que tus tablas se llamen exactamente 'flores' y 'usuarios'
    // Si se llaman distinto (ej: 'flowers'), cámbialas en el código de abajo
    const [flowersRows] = await db.query('SELECT COUNT(*) as total FROM flores');
    const [usersRows] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    
    return {
        inventario: flowersRows[0].total,
        personal: usersRows[0].total,
        pedidosCount: 0,
        ventasTotal: 0
    };
};

module.exports = { getTotals };