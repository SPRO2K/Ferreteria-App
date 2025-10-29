// src/routes/productos.routes.js
const { Router } = require('express');
const router = Router();
const { 
    renderProductList,
    renderAddProductForm,
    addProduct,
    renderEditProductForm,
    updateProduct,
    deleteProduct,
    renderOffersList,
    addOffer,
    removeOffer
} = require('../controllers/producto.controller');

const { isAuthenticated, preventCache } = require('../middlewares/auth.middleware');
const { hasRole } = require('../middlewares/role.middleware');

// Aplicamos la seguridad de Administrador a todo este módulo.
router.use(isAuthenticated, preventCache, hasRole(['Administrador']));

// --- RUTAS PROTEGIDAS ---

router.get('/', renderProductList);
router.get('/add', renderAddProductForm);
router.post('/add', addProduct);
router.get('/edit/:id', renderEditProductForm);
router.post('/edit/:id', updateProduct);
router.get('/delete/:id', deleteProduct);

// Rutas para gestionar ofertas
router.get('/ofertas', renderOffersList);
router.post('/ofertas/add', addOffer);
router.get('/ofertas/remove/:id', removeOffer);

module.exports = router;