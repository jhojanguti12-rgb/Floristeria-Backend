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

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. Servir archivos estáticos ---
// Nota: Nos aseguramos de que las rutas sean absolutas y correctas para el despliegue
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// --- 3. RUTAS DE LA API ---

// Ruta de Salud (Útil para que Render sepa que el server está vivo)
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Servidor floreciendo 🌸' }));

app.use('/api/usuarios', usuarioRouter); 
app.use('/api/flores', flowerRouter); 
app.use('/api/productos', productoRouter); 
app.use('/api/categorias', categoriaRouter); 
app.use('/api/stats', statsRouter);

// Rutas protegidas
app.use('/api/pedidos', verificarToken, pedidoRouter);
app.use('/api/clientes', verificarToken, clienteRouter);
app.use('/api/pagos', verificarToken, pagoRouter);
app.use('/api/entregas', verificarToken, entregaRouter);
app.use('/api/proveedores', verificarToken, proveedorRouter);

// --- 4. CONFIGURACIÓN PARA EL FRONTEND (SPA) ---
/** * Usamos una captura de parámetros para que sea compatible 
 * con las versiones nuevas de path-to-regexp
 */
app.get('/:slug*', (req, res, next) => {
    // Si la ruta empieza por /api, no servimos el HTML
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});