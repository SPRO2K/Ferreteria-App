// src/controllers/vendedor.controller.js
const pool = require('../config/database');

/**
 * Muestra el dashboard principal del vendedor.
 */
const renderVendedorDashboard = (req, res) => {
    res.render('vendedor/dashboard', { title: 'Panel de Vendedor' });
};

/**
 * Muestra la interfaz del Punto de Venta (POS) y le pasa los datos iniciales.
 */
const renderNuevaVenta = async (req, res, next) => {
    try {
        const [sucursales] = await pool.query("SELECT * FROM sucursales ORDER BY nombre ASC");
        
        // Cargamos una lista inicial de productos para mostrar al cargar la página.
        // Incluimos el stock disponible usando un LEFT JOIN con la tabla de inventarios.
        const [initialProducts] = await pool.query(
            `SELECT p.id_producto, p.nombre, p.precio_venta, COALESCE(i.stock, 0) as stock
             FROM productos p
             LEFT JOIN inventarios i ON p.id_producto = i.id_producto AND i.id_almacen = 1
             WHERE p.activo = 1
             ORDER BY p.id_producto DESC 
             LIMIT 20` // Mostramos los 20 productos más recientes
        );

        res.render('vendedor/nueva-venta', { 
            title: 'Nueva Venta', 
            layout: 'pos-layout',
            sucursales,
            initialProducts // Pasamos la lista de productos iniciales a la vista
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Muestra el historial de ventas del vendedor que ha iniciado sesión.
 */
const renderHistorialVentas = async (req, res, next) => {
    try {
        const vendedorId = req.session.user.id;
        const [ventas] = await pool.query(
            `SELECT v.id_venta, v.fecha, v.total, v.metodo_pago, u.nombre as cliente_nombre 
             FROM ventas v 
             JOIN usuarios u ON v.id_cliente_usuario = u.id_usuario 
             WHERE v.id_vendedor_usuario = ? 
             ORDER BY v.fecha DESC`, 
            [vendedorId]
        );
        res.render('vendedor/historial', { title: 'Mi Historial de Ventas', ventas });
    } catch (error) {
        next(error);
    }
};

/**
 * Muestra el detalle completo de una venta específica (factura/recibo).
 */
const renderVentaDetalle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendedorId = req.session.user.id;
        const [ventaRows] = await pool.query(
            `SELECT v.*, suc.nombre as sucursal_nombre, cli.nombre as cliente_nombre, vend.nombre as vendedor_nombre
             FROM ventas v
             JOIN sucursales suc ON v.id_sucursal = suc.id_sucursal
             JOIN usuarios cli ON v.id_cliente_usuario = cli.id_usuario
             JOIN usuarios vend ON v.id_vendedor_usuario = vend.id_usuario
             WHERE v.id_venta = ? AND v.id_vendedor_usuario = ?`,
            [id, vendedorId]
        );
        if (ventaRows.length === 0) return res.redirect('/vendedor/historial');
        const [detalles] = await pool.query(
            `SELECT dv.*, p.nombre as producto_nombre 
             FROM detalle_ventas dv 
             JOIN productos p ON dv.id_producto = p.id_producto 
             WHERE dv.id_venta = ?`,
            [id]
        );
        res.render('vendedor/venta-detalle', { title: `Detalle de Venta #${id}`, venta: ventaRows[0], detalles });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    renderVendedorDashboard,
    renderNuevaVenta,
    renderHistorialVentas,
    renderVentaDetalle
};