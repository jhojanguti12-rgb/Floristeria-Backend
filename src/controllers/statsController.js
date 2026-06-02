const XLSX = require('xlsx');
const db = require('../config/db'); // ⚠️ Asegúrate de que esta sea la ruta real a tu conexión de base de datos (MySQL)

exports.stressTestExcel = async (req, res) => {
  try {
    // 1. Verificar si llegó el archivo
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ningún archivo Excel.' });
    }

    // 2. Leer el archivo desde la memoria
    const libro = XLSX.read(req.file.buffer, { type: 'buffer' });
    const nombreHoja = libro.SheetNames[0];
    const hoja = libro.Sheets[nombreHoja];
    
    // Convertir las filas del Excel a un Array de objetos de JavaScript
    const filas = XLSX.utils.sheet_to_json(hoja); 

    console.log(`Procesando ${filas.length} registros desde el Excel...`);

    // 3. Insertar los registros en la base de datos de MySQL uno por uno o en lote
    // ⚠️ Modifica los nombres de las columnas ('nombre', 'precio', etc.) según cómo se llamen exactamente en tu tabla de MySQL
    for (const fila of filas) {
      const query = `
        INSERT INTO flores (nombre, categoria, stock, precio, fecha_ingreso) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const valores = [
        fila['Nombre'],
        fila['Categoría'],
        fila['Stock'],
        fila['Precio'],
        fila['Fecha de Ingreso']
      ];

      // Ejecutar la consulta en tu base de datos
      await db.query(query, valores); 
    }

    // 4. Responder al Frontend que todo salió perfecto
    res.json({ 
      mensaje: `¡Prueba de estrés exitosa! Se inyectaron correctamente ${filas.length} flores en la base de datos.` 
    });

  } catch (error) {
    console.error('Error en la prueba de estrés:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al procesar el Excel.', error: error.message });
  }
};