// src/routes/vendedor.routes.js
const { Router } = require('express');
const router = Router();
const { 
    renderVendedorDashboard, 
    renderNuevaVenta,
    renderHistorialVentas,
    renderVentaDetalle
} = require('../controllers/vendedor.controller');
const { isAuthenticated, preventCache } = require('../middlewares/auth.middleware');
const { hasRole } = require('../middlewares/role.middleware');

router.use(isAuthenticated, preventCache, hasRole(['Vendedor', 'Administrador']));

router.get('/', renderVendedorDashboard);
router.get('/nueva-venta', renderNuevaVenta);

// Rutas para el historial de ventas
router.get('/historial', renderHistorialVentas);
router.get('/venta/:id', renderVentaDetalle);

module.exports = router;