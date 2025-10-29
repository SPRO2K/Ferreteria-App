// src/routes/bodeguero.routes.js
const { Router } = require('express');
const router = Router();
const { 
    renderBodegueroDashboard,
    renderInventario,
    receiveOrder, 
    updateStock 
} = require('../controllers/bodeguero.controller');
const { isAuthenticated, preventCache } = require('../middlewares/auth.middleware');
const { hasRole } = require('../middlewares/role.middleware');

router.use(isAuthenticated, preventCache, hasRole(['Bodeguero', 'Administrador']));

// La ruta principal del bodeguero es la recepción de órdenes
router.get('/', renderBodegueroDashboard);

// Nueva ruta para ver el inventario
router.get('/inventario', renderInventario);

// Rutas de acción
router.post('/recibir-orden', receiveOrder);
router.post('/update-stock', updateStock);

module.exports = router;