// src/routes/cart.routes.js
const { Router } = require('express');
const router = Router();
const { getCart, addToCart, removeFromCart } = require('../controllers/cart.controller');

// GET /api/cart - Obtener el contenido del carrito
router.get('/', getCart);

// POST /api/cart/add - Añadir un producto al carrito
router.post('/add', addToCart);

// DELETE /api/cart/remove/:id - Eliminar un producto del carrito
router.delete('/remove/:id', removeFromCart);

module.exports = router;