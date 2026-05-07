const errorHandler = (err, req, res, next) => {
    console.error("❌ Error detectado:", err.stack);
    
    res.status(500).json({
        mensaje: 'Algo salió mal en el servidor de la floristería',
        error: err.message
    });
};

module.exports = errorHandler;