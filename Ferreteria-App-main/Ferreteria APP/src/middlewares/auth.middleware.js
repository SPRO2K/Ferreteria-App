// src/middlewares/auth.middleware.js

// Middleware 1: ¿Ha iniciado sesión?
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next(); // Si hay sesión, el usuario puede continuar.
    }
    // Si no hay sesión, lo redirigimos a la página de login.
    res.redirect('/login');
};

// Middleware 2: Prevenir caché del navegador (soluciona el problema del "botón atrás").
const preventCache = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
    res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
    res.setHeader('Expires', '0'); // Proxies.
    next();
};

module.exports = {
    isAuthenticated,
    preventCache
};