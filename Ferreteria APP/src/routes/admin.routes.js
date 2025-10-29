// src/routes/admin.routes.js
const { Router } = require('express');
const router = Router();
const { 
    renderEmployeeList,
    renderEmployeeForm,
    createEmployee,
    renderEditEmployeeForm,
    updateEmployee,
    renderOrderList,
    renderNewOrderForm,
    createOrder,
    renderOrderDetail,
    renderSalesHistory,   // <-- NUEVO
    renderSaleDetailAdmin // <-- NUEVO
} = require('../controllers/admin.controller');

const { isAuthenticated, preventCache } = require('../middlewares/auth.middleware');
const { hasRole } = require('../middlewares/role.middleware');

router.use(isAuthenticated, preventCache, hasRole(['Administrador']));

// --- Rutas de Empleados ---
router.get('/empleados', renderEmployeeList);
router.get('/empleados/add', renderEmployeeForm);
router.post('/empleados/add', createEmployee);
router.get('/empleados/edit/:id', renderEditEmployeeForm);
router.post('/empleados/edit/:id', updateEmployee);

// --- Rutas de Órdenes de Compra ---
router.get('/ordenes-compra', renderOrderList);
router.get('/ordenes-compra/nueva', renderNewOrderForm);
router.post('/ordenes-compra/nueva', createOrder);
router.get('/ordenes-compra/detalle/:id', renderOrderDetail);

// --- NUEVAS RUTAS PARA HISTORIAL DE VENTAS ---
router.get('/ventas', renderSalesHistory);
router.get('/ventas/detalle/:id', renderSaleDetailAdmin);

module.exports = router;