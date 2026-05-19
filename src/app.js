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
const statsRouter = require('./routers/statsRouter');

const app = express();

// --- 1. Middlewares Globales ---
app.use(helmet({
    crossOriginResourcePolicy: false, 
    contentSecurityPolicy: false, 
}));

// Configuración de CORS total para evitar bloqueos con Render
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. Servir archivos estáticos ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// --- 3. RUTAS DE LA API ---

// Ruta de Salud (Crucial para que Render sepa que el servicio está activo)
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Servidor floreciendo 🌸' }));

/** * --- REDIRECCIONES DE COMPATIBILIDAD ---
 */
app.get('/api/resumen', (req, res) => res.redirect(301, '/api/stats'));
app.get('/api/stats/resumen', (req, res) => res.redirect(301, '/api/stats'));

// Definición de rutas públicas/principales
app.use('/api/usuarios', usuarioRouter); 
app.use('/api/flores', flowerRouter); 
app.use('/api/productos', productoRouter); 
app.use('/api/categorias', categoriaRouter); 

// Si tus estadísticas necesitan protección, puedes agregar "verificarToken" aquí.
// Por ahora la dejamos directa como la llama tu Frontend.
app.use('/api/stats', statsRouter); 

// Rutas protegidas (Requieren Token de Administrador)
app.use('/api/pedidos', verificarToken, pedidoRouter);
app.use('/api/clientes', verificarToken, clienteRouter);
app.use('/api/pagos', verificarToken, pagoRouter);
app.use('/api/entregas', verificarToken, entregaRouter);
app.use('/api/proveedores', verificarToken, proveedorRouter);

// --- 4. CONFIGURACIÓN PARA EL FRONTEND (SPA) ---
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

// --- 5. Manejador de Errores ---
app.use(errorHandler);

// Exportación del objeto app para server.js
module.exports = app;