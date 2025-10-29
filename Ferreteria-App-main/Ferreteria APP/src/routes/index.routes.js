// src/routes/index.routes.js
const { Router } = require('express');
const router = Router();
const pool = require('../config/database');
const { isAuthenticated, preventCache } = require('../middlewares/auth.middleware');
const { hasRole } = require('../middlewares/role.middleware');
// Importamos los controladores necesarios para el checkout
const { renderCheckout, createPaymentIntent } = require('../controllers/checkout.controller');

// --- RUTAS PÚBLICAS (NO REQUIEREN LOGIN) ---

// Ruta Principal (Tienda)
router.get('/', async (req, res, next) => {
    try {
        const { search, category } = req.query;
        let sql = `SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.id_categoria = c.id_categoria WHERE p.activo = 1`;
        const params = [];
        if (search) { sql += ` AND p.nombre LIKE ?`; params.push(`%${search}%`); }
        if (category) { sql += ` AND p.id_categoria = ?`; params.push(category); }
        const [productos] = await pool.query(sql, params);
        const [ofertas] = await pool.query("SELECT * FROM productos WHERE es_oferta = 1 AND activo = 1");
        const isFiltering = !!search || !!category;
        res.render('home', { title: 'Ferretería App', productos, ofertas, isFiltering, searchValue: search, categoryValue: category });
    } catch (error) { next(error); }
});

// Página de Ofertas
router.get('/ofertas', async (req, res, next) => {
    try {
        const [productosEnOferta] = await pool.query(`SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.id_categoria = c.id_categoria WHERE p.es_oferta = 1 AND p.activo = 1`);
        res.render('ofertas', { title: 'Ofertas Especiales', productos: productosEnOferta });
    } catch (error) { next(error); }
});

// Página de Detalle de Producto
router.get('/producto/:id', preventCache, async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query( `SELECT p.*, c.nombre as categoria_nombre, m.nombre as marca_nombre FROM productos p JOIN categorias c ON p.id_categoria = c.id_categoria JOIN marcas m ON p.id_marca = m.id_marca WHERE p.id_producto = ? AND p.activo = 1`, [id] );
        if (rows.length === 0) return res.status(404).render('error', { title: 'Producto no encontrado' });
        res.render('producto-detalle', { title: rows[0].nombre, producto: rows[0] });
    } catch (error) { next(error); }
});


// --- RUTAS PRIVADAS (REQUIEREN LOGIN Y ROLES) ---

// Dashboard de Empleados
router.get('/dashboard', isAuthenticated, preventCache, hasRole(['Administrador', 'Vendedor', 'Bodeguero']), (req, res) => {
    const { rol } = req.session.user;
    const userRole = rol.toLowerCase();
    if (userRole === 'administrador') return res.render('admin/dashboard', { title: 'Panel de Administrador' });
    if (userRole === 'vendedor') return res.render('vendedor/dashboard', { title: 'Panel de Vendedor' });
    if (userRole === 'bodeguero') return res.render('bodeguero/dashboard', { title: 'Panel de Bodeguero' });
    return res.redirect('/');
});

// Cuenta de Cliente
router.get('/mi-cuenta', isAuthenticated, preventCache, hasRole(['Cliente']), async (req, res, next) => {
    try {
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ?", [req.session.user.id]);
        if (rows.length === 0) return req.session.destroy(() => res.redirect('/login'));
        res.render('cliente/cuenta', { title: 'Mi Perfil', cliente: rows[0], isProfile: true });
    } catch (error) { next(error); }
});

router.get('/mis-compras', isAuthenticated, preventCache, hasRole(['Cliente']), async (req, res, next) => {
    try {
        const [compras] = await pool.query("SELECT * FROM ventas WHERE id_cliente_usuario = ? ORDER BY fecha DESC", [req.session.user.id]);
        res.render('cliente/cuenta', { title: 'Mis Compras', compras, isShoppingHistory: true });
    } catch (error) { next(error); }
});

// --- RUTA AÑADIDA PARA VER EL DETALLE DE UNA COMPRA ---
router.get('/mis-compras/:id', isAuthenticated, preventCache, hasRole(['Cliente']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.session.user.id;

        const [ventaRows] = await pool.query(
            `SELECT v.*, suc.nombre as sucursal_nombre 
             FROM ventas v 
             JOIN sucursales suc ON v.id_sucursal = suc.id_sucursal
             WHERE v.id_venta = ? AND v.id_cliente_usuario = ?`,
            [id, userId]
        );

        if (ventaRows.length === 0) {
            return res.redirect('/mis-compras');
        }

        const [detalles] = await pool.query(
            `SELECT dv.*, p.nombre as producto_nombre, p.imagen
             FROM detalle_ventas dv 
             JOIN productos p ON dv.id_producto = p.id_producto 
             WHERE dv.id_venta = ?`,
            [id]
        );

        res.render('cliente/compra-detalle', {
            title: `Detalle de Compra #${id}`,
            venta: ventaRows[0],
            detalles
        });

    } catch (error) {
        next(error);
    }
});

// --- NUEVA RUTA DE API PARA DETALLES DE PRODUCTO ---
router.get('/api/product-details/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT nombre, imagen FROM productos WHERE id_producto = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
});


// Proceso de Pago (Checkout)
router.get('/checkout', isAuthenticated, preventCache, hasRole(['Cliente']), renderCheckout);
router.post('/create-payment-intent', isAuthenticated, hasRole(['Cliente']), createPaymentIntent);


module.exports = router;