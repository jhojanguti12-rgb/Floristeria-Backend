const express = require('express');
const router = express.Router();
// Importa tus modelos (ajusta la ruta según donde estén tus modelos reales)
const Flower = require('../models/Flower'); 
const Pedido = require('../models/Pedido');
const Usuario = require('../models/Usuario');

router.get('/resumen', async (req, res) => {
  try {
    // 1. Contar flores (Inventario)
    const totalFlores = await Flower.countDocuments();
    
    // 2. Contar usuarios (Personal)
    const totalPersonal = await Usuario.countDocuments();
    
    // 3. Contar pedidos totales
    const totalPedidos = await Pedido.countDocuments();
    
    // 4. Calcular ventas totales (Suma de la columna 'total' de pedidos)
    const ventasRecaudadas = await Pedido.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    // 5. Obtener los últimos 4 pedidos para la lista del dashboard
    const pedidosRecientes = await Pedido.find()
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({
      inventario: totalFlores,
      personal: totalPersonal,
      pedidosCount: totalPedidos,
      ventasTotal: ventasRecaudadas[0]?.total || 0,
      pedidosLista: pedidosRecientes
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener estadísticas", error });
  }
});

module.exports = router;