const XLSX = require('xlsx');

// 1. Definimos las colecciones/categorías de tu floristería
const categorias = ['flores ornamentales', 'Dia enamorados', 'Flores de bodas'];

// 2. Variaciones de nombres para combinar y generar 1000 productos únicos
const adjetivos = [
  'Premium', 'Importado(a)', 'Nacional', 'Especial', 'Eterno(a)', 'Exótico(a)', 'Silvestre', 
  'de Primavera', 'de Verano', 'Imperial', 'Deluxe', 'Clásico(a)', 'Elegante', 'Silvestre'
];

const colores = [
  'Rojo(a)', 'Blanco(a)', 'Amarillo(a)', 'Rosado(a)', 'Azul', 'Morado(a)', 'Violeta', 
  'Naranja', 'Bicolor', 'Crema', 'Pastel', 'Encendido(a)'
];

console.log("Generando los 1000 registros de flores...");

const productos = [];

// 3. Bucle para crear exactamente 1000 filas
for (let i = 1; i <= 1000; i++) {
  // Seleccionar una categoría de forma cíclica o aleatoria
  const categoria = categorias[i % categorias.length];
  
  // Estructurar un nombre descriptivo único combinando elementos
  const adj = adjetivos[Math.floor(Math.random() * adjetivos.length)];
  const col = colores[Math.floor(Math.random() * colores.length)];
  
  let nombreBase = '';
  if (categoria === 'Arreglos Fúnebres') nombreBase = 'Corona Fúnebre';
  else if (categoria === 'Detalles') nombreBase = 'Florero de Regalo';
  else nameBase = `Ramo de ${categoria.slice(0, -1)}`; // Quita la 's' del final (ej: Rosas -> Ramo de Rosa)

  const nombreProducto = `${nombreBase} ${col} ${adj} #${i}`;

  // Precios lógicos según la categoría (en Pesos Colombianos COP)
  let precio = 5000;
  if (categoria === 'Arreglos Fúnebres') {
    precio = Math.floor(Math.random() * (250000 - 120000 + 1)) + 120000; // Entre 120k y 250k
  } else if (categoria === 'Orquídeas' || categoria === 'Arreglos') {
    precio = Math.floor(Math.random() * (90000 - 45000 + 1)) + 45000;    // Entre 45k y 90k
  } else {
    precio = Math.floor(Math.random() * (40000 - 7000 + 1)) + 7000;      // Entre 7k y 40k
  }

  // Cantidades de stock aleatorias (entre 5 y 120 unidades)
  const stock = Math.floor(Math.random() * (120 - 5 + 1)) + 5;

  // Fecha de ingreso simulada dentro de los últimos 7 días
  const diasAtras = Math.floor(Math.random() * 8); 
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - diasAtras);
  const fechaIngreso = fecha.toISOString().split('T')[0];

  // Insertar fila respetando los nombres de columna exactos que espera tu backend
  productos.push({
    'Nombre': nombreProducto,
    'Categoría': categoria,
    'Stock': stock,
    'Precio': precio,
    'Fecha de Ingreso': fechaIngreso
  });
}

// 4. Construir el archivo de Excel usando la librería XLSX
const hojaDeTrabajo = XLSX.utils.json_to_sheet(productos);
const libroDeTrabajo = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, 'Inventario_Test');

// Ajustar automáticamente el ancho de las columnas para que sea legible
const columnasAncho = [
  { wch: 40 }, // Nombre
  { wch: 20 }, // Categoría
  { wch: 10 }, // Stock
  { wch: 15 }, // Precio
  { wch: 18 }  // Fecha de Ingreso
];
hojaDeTrabajo['!cols'] = columnasAncho;

// 5. Escribir el archivo en el disco duro
const nombreArchivo = 'mil_flores.xlsx';
XLSX.writeFile(libroDeTrabajo, nombreArchivo);

console.log(`¡Listo! El archivo "${nombreArchivo}" ha sido creado con éxito conteniendo ${productos.length} registros.`);