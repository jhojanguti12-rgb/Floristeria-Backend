const db = require('../config/db');

// --- FUNCIÓN DEL DASHBOARD COMERCIAL (CONSERVADA) ---
const getResumenStats = async () => {
  try {
    const [resFlores] = await db.query('SELECT COUNT(*) as t FROM flores');
    const [resUsuarios] = await db.query('SELECT COUNT(*) as t FROM usuarios');
    const [resPedidosT] = await db.query('SELECT COUNT(*) as t, SUM(total) as s FROM pedidos');
    
    const [filasPedidos] = await db.query(`
      SELECT 
        p.id, 
        p.total, 
        IFNULL(c.nombre, 'Cliente Anónimo') AS nombre_cliente
      FROM pedidos p 
      LEFT JOIN clientes c ON p.id_cliente = c.id 
      ORDER BY p.id DESC 
      LIMIT 5
    `);

    const inventario = resFlores[0]?.t || 0;
    const personal = resUsuarios[0]?.t || 0;
    const pedidosCount = resPedidosT[0]?.t || 0;
    const ventasTotal = Number(resPedidosT[0]?.s) || 0;

    const pedidosLista = Array.isArray(filasPedidos) ? filasPedidos.map(p => ({
      id: p.id,
      cliente: p.nombre_cliente || "Sin Nombre",
      nombre: p.nombre_cliente || "Sin Nombre",
      total: Number(p.total) || 0,
      status: "completado"
    })) : [];

    return {
      inventario,
      personal,
      pedidosCount,
      ventasTotal,
      pedidosLista,
      ventasGrafico: [0, 0, 0, 0, 0, 0, 0]
    };

  } catch (error) {
    console.error("❌ Error en statsService:", error);
    return { 
      inventario: 0, 
      personal: 0, 
      pedidosCount: 0, 
      ventasTotal: 0, 
      pedidosLista: [],
      ventasGrafico: [0, 0, 0, 0, 0, 0, 0]
    };
  }
};

// =================================================================
// 🌟 PUNTO 1 DEL PARCIAL (RF-01): INYECCIÓN MASIVA DE FLORES REALES
// =================================================================
const ejecutarInyeccionMasivaFlores = async (cantidad) => {
  const connection = await db.getConnection(); 
  try {
    await connection.beginTransaction(); // Transacción de alta velocidad

    // Usamos el ID 11 que verificamos en tu Workbench ("flores ornamentales")
    const idCategoriaExistente = 11; 

    // Query con columnas exactas en minúsculas
    const query = 'INSERT INTO flores (nombre, precio, stock, id_categoria) VALUES (?, ?, ?, ?)';
    
    const tiposFlores = ['Rosa Roja Premium', 'Girasol Gigante', 'Tulipán Holandés', 'Orquídea Blanca', 'Lirio Perfumado'];

    for (let i = 1; i <= cantidad; i++) {
      const tipoBase = tiposFlores[i % tiposFlores.length];
      const nombreFlor = `${tipoBase} Lote-${i}`;
      const precio = Math.floor(Math.random() * (45000 - 12000 + 1)) + 12000; // Precios entre 12k y 45k
      const stock = Math.floor(Math.random() * (120 - 15 + 1)) + 15; // Stock entre 15 y 120 unidades

      await connection.query(query, [nombreFlor, precio, stock, idCategoriaExistente]);
    }

    await connection.commit(); // Guardamos los 1050 productos de un solo golpe
    return true;
  } catch (error) {
    await connection.rollback(); 
    console.error("❌ Error en ejecutarInyeccionMasivaFlores:", error.message);
    throw error;
  } finally {
    connection.release(); 
  }
};

module.exports = { 
  getResumenStats, 
  ejecutarInyeccionMasivaFlores 
};