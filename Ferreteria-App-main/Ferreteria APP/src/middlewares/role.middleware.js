// src/middlewares/role.middleware.js
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const { rol } = req.session.user;
        const rolesInLowerCase = allowedRoles.map(r => r.toLowerCase());
        
        // ¡LÍNEA CLAVE! Comprueba si el rol del usuario está en la lista de permitidos.
        if (rol && rolesInLowerCase.includes(rol.toLowerCase())) {
            return next(); // Permiso concedido
        } else {
            // Permiso denegado
            res.status(403).render('error', {
                title: 'Acceso Denegado',
                message: `No tienes los permisos de [${allowedRoles.join(', ')}] necesarios para acceder a esta sección.`,
                layout: 'main'
            });
        }
    };
};
module.exports = { hasRole };