// src/routes/pos.api.routes.js
const { Router } = require('express');
const router = Router();
const { searchProducts, searchClients, processSale } = require('../controllers/pos.api.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

// Todas las rutas de la API del POS deben estar protegidas para asegurar que solo un usuario logueado las use.
router.use(isAuthenticated);

// API para buscar productos en tiempo real mientras el vendedor escribe.
// Ejemplo de llamada: GET /api/pos/search-products?term=taladro
router.get('/search-products', searchProducts);

// API para buscar clientes en tiempo real.
// Ejemplo de llamada: GET /api/pos/search-clients?term=juan
router.get('/search-clients', searchClients);

// API para procesar y finalizar una venta.
// Recibe los datos del carrito de venta y el cliente en el cuerpo de la petición.
// Ejemplo de llamada: POST /api/pos/checkout
router.post('/checkout', processSale);

module.exports = router;