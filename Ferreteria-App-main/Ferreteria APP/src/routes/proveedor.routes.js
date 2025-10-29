// src/routes/proveedor.routes.js
const { Router } = require('express');
const router = Router();
const { renderProveedorDashboard, markAsShipped } = require('../controllers/proveedor.controller');
const { isAuthenticated, preventCache } = require('../middlewares/auth.middleware');
const { hasRole } = require('../middlewares/role.middleware');

// Seguridad: Solo un 'Proveedor' o un 'Administrador' pueden acceder a este módulo
router.use(isAuthenticated, preventCache, hasRole(['Proveedor', 'Administrador']));

// Ruta principal del proveedor (GET /proveedor)
router.get('/', renderProveedorDashboard);

// Ruta para marcar una orden como enviada (POST /proveedor/orden/enviar)
router.post('/orden/enviar', markAsShipped);

module.exports = router;