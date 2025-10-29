// =================================================================
// ARCHIVO PRINCIPAL DE LA APLICACIÓN (app.js) - VERSIÓN FINAL CON HELPERS
// =================================================================

// 1. IMPORTACIONES DE MÓDULOS
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { engine } = require('express-handlebars');
const session = require('express-session');
const { loadGlobalData } = require('./src/middlewares/view.middleware');

// 2. CONFIGURACIÓN INICIAL
dotenv.config();
const app = express();
app.set('port', process.env.PORT || 3000);

// 3. ARCHIVOS ESTÁTICOS (SERVIR PRIMERO PARA MEJOR RENDIMIENTO)
app.use(express.static(path.join(__dirname, 'src/public')));

// 4. CONFIGURACIÓN DEL MOTOR DE VISTAS (Handlebars)
app.set('views', path.join(__dirname, 'src/views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    // HELPERS: Funciones personalizadas para usar en las plantillas .hbs
    helpers: {
        eq: (a, b) => a === b,
        lt: (a, b) => parseFloat(a) < parseFloat(b),
        multiply: (a, b) => (parseFloat(a) * parseFloat(b)).toFixed(2),
        
        // --- HELPERS AÑADIDOS PARA FORMATEAR LA FECHA ---
        // Permite dividir un string: {{split "2025-10-18T..." "T"}}
        split: function (string, separator) {
            if (typeof string !== 'string') return [string]; // Manejo de seguridad
            return string.split(separator);
        },
        // Permite acceder a un índice de un array: {{lookup (split ...) 0}}
        lookup: function (obj, field) {
            return obj && obj[field]; // Manejo de seguridad
        }
    }
}));
app.set('view engine', '.hbs');

// 5. MIDDLEWARES DE PROCESAMIENTO
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'un_secreto_muy_seguro',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' }
}));

// 6. MIDDLEWARES DE DATOS PARA LAS VISTAS
app.use(loadGlobalData);
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// 7. RUTAS DE LA APLICACIÓN
app.use('/', require('./src/routes/index.routes'));
app.use('/', require('./src/routes/auth.routes'));
app.use('/productos', require('./src/routes/productos.routes'));
app.use('/admin', require('./src/routes/admin.routes'));
app.use('/vendedor', require('./src/routes/vendedor.routes.js'));
app.use('/bodeguero', require('./src/routes/bodeguero.routes.js'));
app.use('/api/cart', require('./src/routes/cart.routes'));
app.use('/api/pos', require('./src/routes/pos.api.routes.js'));
app.use('/proveedor', require('./src/routes/proveedor.routes.js')); 

// 8. MANEJO DE ERRORES
app.use((req, res, next) => {
    res.status(404).render('error', { title: 'Página no encontrada', message: 'La página que buscas no existe.', layout: 'main' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: 'Error en el Servidor', message: 'Ha ocurrido un error inesperado.' });
});

// 9. ARRANQUE DEL SERVIDOR
app.listen(app.get('port'), () => {
    console.log('🚀 Servidor corriendo en el puerto', app.get('port'));
    console.log('   Accede en http://localhost:' + app.get('port'));
});