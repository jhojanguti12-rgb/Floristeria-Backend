const XLSX = require('xlsx');
const db = require('../config/db'); // Tu archivo de conexión a MySQL
const { performance } = require('perf_hooks'); // Librería nativa de Node para medir la latencia con alta precisión

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
    const mapeoCategorias = {
      'flores ornamentales': 11,
      'Dia enamorados': 12,
      'Flores de bodas': 18
    };

    // 3. Recorrer e insertar las filas
    for (const fila of filas) {
      
      const textoCategoria = fila['Categoría'];
      const idCategoria = mapeoCategorias[textoCategoria] || 11;

      let colorDetectado = 'Variado';
      const nombreProducto = fila['Nombre'] || '';
      if (nombreProducto.includes('Rojo')) colorDetectado = 'Rojo';
      else if (nombreProducto.includes('Blanco')) colorDetectado = 'Blanco';
      else if (nombreProducto.includes('Amarillo')) colorDetectado = 'Amarillo';
      else if (nombreProducto.includes('Rosado')) colorDetectado = 'Rosado';
      else if (nombreProducto.includes('Azul')) colorDetectado = 'Azul';
      else if (nombreProducto.includes('Morado')) colorDetectado = 'Morado';

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
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9'
      ];

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

exports.obtenerEstadisticasGenerales = async (req, res) => {
  try {
    // =====================================================================
    // MEDIDOR DE DESEMPEÑO E INTEGRIDAD: RF-02 y RF-03
    // =====================================================================
    const inicioTiempo = performance.now(); // Inicia el cronómetro de latencia

    // RF-02: Consulta optimizada para contar la tabla más importante (flores)
    const queryContarFlores = 'SELECT COUNT(*) AS totalRegistrosFlores FROM flores';
    
    let resultadoContar;
    if (db.execute) {
      [resultadoContar] = await db.execute(queryContarFlores);
    } else {
      [resultadoContar] = await db.query(queryContarFlores);
    }
    
    const finalTiempo = performance.now(); // Detiene el cronómetro
    const latenciaCalculada = (finalTiempo - inicioTiempo).toFixed(2); // RF-03: Latencia en milisegundos
    const totalFloresRegistradas = resultadoContar[0]?.totalRegistrosFlores || 0;

    // Imprimir en los logs de Render para tu sustentación visual
    console.log(`\n=== METRICAS DE DESEMPEÑO BASE DE DATOS ===`);
    console.log(`[RF-02] Total registros de la tabla más importante (flores): ${totalFloresRegistradas}`);
    console.log(`[RF-03] Latencia de la consulta: ${latenciaCalculada} ms\n============================================`);

    // =====================================================================
    // CONSULTAS ORIGINALES DEL DASHBOARD (Sin alteraciones)
    // =====================================================================
    const queryStock = 'SELECT COALESCE(SUM(stock), 0) AS inventario FROM flores';
    const queryPedidos = 'SELECT COUNT(*) AS pedidosCount FROM pedidos';
    const queryVentas = 'SELECT COALESCE(SUM(total), 0) AS ventasTotal FROM pedidos'; 
    const queryPersonal = 'SELECT COUNT(*) AS personal FROM usuarios';
    const queryListaPedidos = 'SELECT id, total, id AS cliente FROM pedidos ORDER BY id DESC LIMIT 5';

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

    let pedidosListaProcesada = [];
    if (Array.isArray(listaRes) && listaRes.length > 0) {
      pedidosListaProcesada = listaRes.map(p => ({
        id: p.id,
        cliente: `Pedido #${p.id}`,
        total: p.total || 0,
        fecha: new Date().toISOString().split('T')[0]
      }));
    }

    // Enviar el JSON incluyendo los nuevos campos calculados del RF-02 y RF-03
    const respuestaDashboard = {
      inventario: Number(stockRes[0]?.inventario) || 0,
      personal: Number(personalRes[0]?.personal) || 0,
      pedidosCount: Number(pedidosRes[0]?.pedidosCount) || 0,
      ventasTotal: Number(ventasRes[0]?.ventasTotal) || 0,
      pedidosLista: pedidosListaProcesada,
      
      // Variables adjuntas para el parcial
      rf02_totalRegistros: totalFloresRegistradas,
      rf03_latencia: `${latenciaCalculada} ms`
    };

    console.log("Enviando estadísticas al frontend con éxito:", respuestaDashboard);
    return res.json(respuestaDashboard);

  } catch (error) {
    console.error('🔴 Error real al obtener estadísticas:', error);
    return res.status(500).json({ 
      mensaje: 'Error al compilar el resumen del panel.',
      error: error.message 
    });
  }
};