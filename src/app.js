require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path'); 
const errorHandler = require('./middlewares/errorhandler');
const verificarToken = require('./middlewares/authMiddleware');

// Importación de Routers
const flowerRouter = require('./routers/flowerRouter');
const pedidoRouter = require('./routers/pedidoRouter');
const clienteRouter = require('./routers/ClienteRouter');
const usuarioRouter = require('./routers/usuarioRouter');
const pagoRouter = require('./routers/pagoRouter');
const categoriaRouter = require('./routers/categoriaRouter');
const entregaRouter = require('./routers/entregaRouter');
const proveedorRouter = require('./routers/proveedorRouter');
const productoRouter = require('./routers/productoRouter');

const app = express();

// --- 1. Middlewares Globales ---
app.use(helmet({
    crossOriginResourcePolicy: false, 
    contentSecurityPolicy: false, 
}));

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. Servir archivos estáticos ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// --- 3. RUTAS DE LA API ---
app.use('/api/usuarios', usuarioRouter); 
app.use('/api/flores', flowerRouter); 
app.use('/api/productos', productoRouter); 
app.use('/api/categorias', categoriaRouter); 

// Rutas protegidas
app.use('/api/pedidos', verificarToken, pedidoRouter);
app.use('/api/clientes', verificarToken, clienteRouter);
app.use('/api/pagos', verificarToken, pagoRouter);
app.use('/api/entregas', verificarToken, entregaRouter);
app.use('/api/proveedores', verificarToken, proveedorRouter);

// --- 4. CONFIGURACIÓN PARA EL FRONTEND (VITE) ---
/** * SOLUCIÓN AL ERROR DE RENDER:
 * Usamos una Regex que dice: "Si la ruta NO empieza con /api, sirve el index.html"
 * Esto evita el error de PathError [TypeError]: Missing parameter name
 */
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// --- 5. Manejador de Errores ---
app.use(errorHandler);

module.exports = app;