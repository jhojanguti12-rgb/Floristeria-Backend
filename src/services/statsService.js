const db = require('../config/db');

// --- FUNCIÓN ACTUAL DE TU DASHBOARD (SE CONSERVA INTACTA) ---
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
// 🌟 NUEVAS FUNCIONES PARA EL PARCIAL DE BASE DE DATOS
// =================================================================

// 🚀 RF-01: Inyección masiva de registros utilizando una transacción veloz
const ejecutarStressTestInyeccion = async (cantidad) => {
  const connection = await db.getConnection(); // Tomamos una conexión única dedicada
  try {
    await connection.beginTransaction(); // Iniciamos transacción en MySQL

    const query = 'INSERT INTO proveedores (nombre, telefono, contacto_nombre) VALUES (?, ?, ?)';
    
    for (let i = 1; i <= cantidad; i++) {
      const nombre = `Stress Test Prov ${i}`;
      const telefono = `300${String(i).padStart(7, '0')}`;
      const contacto = `Asesor Evaluacion ${i}`;
      
      await connection.query(query, [nombre, telefono, contacto]);
    }

    await connection.commit(); // Guardamos los 1050 registros de un solo golpe en Aiven
    return true;
  } catch (error) {
    await connection.rollback(); // Si falla, revierte todo para proteger la DB
    console.error("❌ Error en ejecutarStressTestInyeccion:", error.message);
    throw error;
  } finally {
    connection.release(); // Liberamos la conexión de vuelta al pool
  }
};

// 📊 RF-02: Consulta para saber cuántos registros tiene la tabla
const obtenerConteoFilasParcial = async () => {
  try {
    const query = 'SELECT COUNT(*) AS total FROM proveedores';
    const [rows] = await db.query(query);
    return rows[0].total;
  } catch (error) {
    console.error("❌ Error en obtenerConteoFilasParcial:", error.message);
    throw error;
  }
};

module.exports = { 
  getResumenStats, 
  ejecutarStressTestInyeccion, 
  obtenerConteoFilasParcial 
};