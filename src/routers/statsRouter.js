const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Tu conexión a MySQL

router.get('/resumen', async (req, res) => {
  try {
    // 1. Ejecutamos todas las consultas en paralelo para que sea rápido
    // IMPORTANTE: Verifica que tus tablas se llamen 'flowers', 'usuarios' y 'pedidos'
    const [flowersCount] = await db.query('SELECT COUNT(*) as total FROM flowers');
    const [usersCount] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    
    // Usamos try/catch interno para pedidos por si aún no tienes esa tabla creada
    let totalPedidos = 0;
    let ventasTotal = 0;
    let pedidosLista = [];

    try {
      const [ordersCount] = await db.query('SELECT COUNT(*) as total FROM pedidos');
      const [salesSum] = await db.query('SELECT SUM(total) as totalRecaudado FROM pedidos');
      const [recentOrders] = await db.query('SELECT * FROM pedidos ORDER BY id DESC LIMIT 4');
      
      totalPedidos = ordersCount[0].total;
      ventasTotal = salesSum[0].totalRecaudado || 0;
      pedidosLista = recentOrders;
    } catch (e) {
      console.log("Tabla pedidos no encontrada o vacía, enviando ceros.");
    }

    // 2. Enviamos la respuesta al Dashboard
    res.json({
      inventario: flowersCount[0].total,
      personal: usersCount[0].total,
      pedidosCount: totalPedidos,
      ventasTotal: ventasTotal,
      pedidosLista: pedidosLista
    });

  } catch (error) {
    console.error("Error en las estadísticas:", error);
    res.status(500).json({ mensaje: "Error al obtener estadísticas", error: error.message });
  }
});

module.exports = router;