// src/middlewares/view.middleware.js
const pool = require('../config/database');

// Middleware para cargar datos globales que todas las vistas necesitan
const loadGlobalData = async (req, res, next) => {
    try {
        console.log("  -> [MIDDLEWARE] Ejecutando loadGlobalData...");
        
        // Ejecutamos la consulta a la base de datos
        const [categorias] = await pool.query("SELECT * FROM categorias ORDER BY nombre ASC");
        
        // Añadimos los datos a 'res.locals' para que estén disponibles en las plantillas
        res.locals.categorias = categorias;
        
        console.log(`  -> [MIDDLEWARE] loadGlobalData completado. ${categorias.length} categorías cargadas.`);
        
        // Continuamos al siguiente middleware o a la ruta
        next();
    } catch (error) {
        console.error("  !! [ERROR] en middleware loadGlobalData:", error);
        next(error);
    }
};

module.exports = { loadGlobalData };