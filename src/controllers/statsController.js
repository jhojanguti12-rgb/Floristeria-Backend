const XLSX = require('xlsx');
const db = require('../config/db'); // Tu archivo de conexión a MySQL

exports.stressTestExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ningún archivo Excel.' });
    }

    // 1. Leer el Excel desde la memoria
    const libro = XLSX.read(req.file.buffer, { type: 'buffer' });
    const nombreHoja = libro.SheetNames[0];
    const hoja = libro.Sheets[nombreHoja];
    const filas = XLSX.utils.sheet_to_json(hoja); 

    console.log(`Iniciando inyección masiva de ${filas.length} registros...`);

    // 2. Mapeo de Categorías de Texto a IDs numéricos reales de tu MySQL
    // Cruzado exactamente con los datos de tu imagen de MySQL Workbench
    const mapeoCategorias = {
      'flores ornamentales': 11,
      'Dia enamorados': 12,
      'Flores de bodas': 18
    };

    // 3. Recorrer e insertar las filas
    for (const fila of filas) {
      
      // Obtener el ID numérico de la categoría. Si por alguna razón no coincide, le ponemos la 11 por defecto
      const textoCategoria = fila['Categoría'];
      const idCategoria = mapeoCategorias[textoCategoria] || 11;

      // Extraer un color básico del nombre generado en el Excel (Ej: "Ramo de Rosas Rojo(a) Premium" -> extrae "Rojo(a)")
      // Si no encuentra coincidencia en el nombre, le asignamos "Variado"
      let colorDetectado = 'Variado';
      const nombreProducto = fila['Nombre'] || '';
      if (nombreProducto.includes('Rojo')) colorDetectado = 'Rojo';
      else if (nombreProducto.includes('Blanco')) colorDetectado = 'Blanco';
      else if (nombreProducto.includes('Amarillo')) colorDetectado = 'Amarillo';
      else if (nombreProducto.includes('Rosado')) colorDetectado = 'Rosado';
      else if (nombreProducto.includes('Azul')) colorDetectado = 'Azul';
      else if (nombreProducto.includes('Morado')) colorDetectado = 'Morado';

      // Estructurar la consulta con los campos EXACTOS de tu base de datos
      const query = `
        INSERT INTO flores (nombre, color, precio, stock, id_categoria, imagen_url) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const valores = [
        nombreProducto,
        colorDetectado,
        Number(fila['Precio']) || 0,
        Number(fila['Stock']) || 0,
        idCategoria,
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9' // URL de imagen genérica por si es obligatoria
      ];

      // Ejecutar de forma compatible con tu configuración de Base de Datos
      if (db.execute) {
        await db.execute(query, valores);
      } else if (db.query) {
        await db.query(query, valores);
      } else {
        await db.sequelize.query(query, { replacements: valores });
      }
    }

    return res.json({ 
      mensaje: `¡Prueba de estrés completada con éxito! Se inyectaron ${filas.length} flores asociadas a sus categorías numéricas.` 
    });

  } catch (error) {
    console.error('🔴 Error en el backend:', error);
    return res.status(500).json({ 
      mensaje: 'Error interno en el servidor al procesar las filas.', 
      detalles: error.message 
    });
  }
};
// Función corregida con el formato exacto que espera tu Frontend (App.jsx)
exports.obtenerEstadisticasGenerales = async (req, res) => {
  try {
    // 1. Sumar el stock total de la tabla flores
    const queryStock = 'SELECT COALESCE(SUM(stock), 0) AS inventario FROM flores';
    
    // 2. Contar el total de pedidos
    const queryPedidos = 'SELECT COUNT(*) AS pedidosCount FROM pedidos';
    
    // 3. Sumar el total de ventas (puedes apuntar a la tabla pagos o pedidos según tu estructura)
    // Usamos COALESCE por si la tabla está vacía, para que devuelva 0 en vez de NULL
    const queryVentas = 'SELECT COALESCE(SUM(total), 0) AS ventasTotal FROM pedidos'; 
    
    // 4. Contar el total de personal/usuarios
    const queryPersonal = 'SELECT COUNT(*) AS personal FROM usuarios';

    // 5. Obtener los últimos 5 pedidos para la tabla del inicio
    const queryListaPedidos = 'SELECT id, cliente, total, fecha FROM pedidos ORDER BY id DESC LIMIT 5';

    let stockRes, pedidosRes, ventasRes, personalRes, listaRes;

    if (db.execute) {
      [stockRes] = await db.execute(queryStock);
      [pedidosRes] = await db.execute(queryPedidos);
      [ventasRes] = await db.execute(queryVentas);
      [personalRes] = await db.execute(queryPersonal);
      [listaRes] = await db.execute(queryListaPedidos);
    } else {
      [stockRes] = await db.query(queryStock);
      [pedidosRes] = await db.query(queryPedidos);
      [ventasRes] = await db.query(queryVentas);
      [personalRes] = await db.query(queryPersonal);
      [listaRes] = await db.query(queryListaPedidos);
    }

    // 6. Construir la respuesta con los nombres EXACTOS de tu App.jsx
    const respuestaDashboard = {
      inventario: Number(stockRes[0]?.inventario) || 0,
      personal: Number(personalRes[0]?.personal) || 0,
      pedidosCount: Number(pedidosRes[0]?.pedidosCount) || 0,
      ventasTotal: Number(ventasRes[0]?.ventasTotal) || 0,
      pedidosLista: Array.isArray(listaRes) ? listaRes : []
    };

    console.log("Enviando estadísticas al frontend:", respuestaDashboard);
    
    return res.json(respuestaDashboard);

  } catch (error) {
    console.error('🔴 Error al obtener estadísticas:', error);
    return res.status(500).json({ 
      mensaje: 'Error al compilar el resumen del panel.',
      error: error.message 
    });
  }
};