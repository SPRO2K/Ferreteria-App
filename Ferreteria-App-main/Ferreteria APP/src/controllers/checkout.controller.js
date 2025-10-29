
// src/controllers/checkout.controller.js
const pool = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Obtiene el carrito del usuario y renderiza la página de checkout.
 */
const renderCheckout = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const [cartRows] = await pool.query("SELECT id_carrito FROM carritos WHERE id_usuario = ?", [userId]);
        if (cartRows.length === 0) return res.redirect('/'); // Si no hay carrito, vuelve a la tienda
        
        const cartId = cartRows[0].id_carrito;
        const [items] = await pool.query(`SELECT p.nombre, p.precio_venta, dc.cantidad FROM detalle_carritos dc JOIN productos p ON dc.id_producto = p.id_producto WHERE dc.id_carrito = ?`, [cartId]);

        if (items.length === 0) return res.redirect('/'); // Si el carrito está vacío

        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.precio_venta) * item.cantidad), 0);
        const iva = subtotal * 0.15;
        const total = subtotal + iva;

        res.render('checkout', {
            title: 'Finalizar Compra',
            items,
            subtotal: subtotal.toFixed(2),
            iva: iva.toFixed(2),
            total: total.toFixed(2),
            stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    } catch (error) {
        next(error);
    }
};

/**
 * API que se comunica con Stripe para crear una intención de pago
 * y, si es exitoso, guarda la venta en la base de datos.
 */
const createPaymentIntent = async (req, res, next) => {
    const { payment_method_id } = req.body;
    const userId = req.session.user.id;
    let connection;

    try {
        // 1. Obtener el carrito y calcular el total de nuevo en el backend (por seguridad)
        const [cartRows] = await pool.query("SELECT id_carrito FROM carritos WHERE id_usuario = ?", [userId]);
        if (cartRows.length === 0) throw new Error("Carrito no encontrado");
        const cartId = cartRows[0].id_carrito;
        const [items] = await pool.query(`SELECT dc.id_producto, dc.cantidad, p.precio_venta FROM detalle_carritos dc JOIN productos p ON dc.id_producto = p.id_producto WHERE dc.id_carrito = ?`, [cartId]);
        if (items.length === 0) throw new Error("El carrito está vacío.");

        const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.precio_venta) * item.cantidad), 0);
        const total = subtotal * 1.15;
        const amountInCents = Math.round(total * 100); // Stripe trabaja en centavos

        // 2. Crear la Intención de Pago en Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd', // O la moneda que uses, ej: 'mxn'
            payment_method: payment_method_id,
            confirm: true,
            automatic_payment_methods: { enabled: true, allow_redirects: 'never' }
        });

        // 3. Si el pago en Stripe fue exitoso, procedemos a guardar en nuestra BD
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // (Lógica de transacción similar al POS del Vendedor)
        const [ventaResult] = await connection.query("INSERT INTO ventas (id_cliente_usuario, id_vendedor_usuario, id_sucursal, total, metodo_pago) VALUES (?, ?, ?, ?, ?)", [userId, 1, 1, total.toFixed(2), 'Tarjeta']); // Asumimos vendedor 1 y sucursal 1 para ventas online
        const ventaId = ventaResult.insertId;
        const detalleValues = items.map(item => [ventaId, item.id_producto, item.cantidad, item.precio_venta]);
        await connection.query("INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES ?", [detalleValues]);
        for (const item of items) {
            await connection.query("UPDATE inventarios SET stock = stock - ? WHERE id_producto = ?", [item.cantidad, item.id_producto]);
        }
        await connection.query("DELETE FROM detalle_carritos WHERE id_carrito = ?", [cartId]);
        
        await connection.commit();

        res.json({ success: true, ventaId: ventaId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en el pago:", error.message);
        res.status(500).json({ error: { message: error.message } });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    renderCheckout,
    createPaymentIntent
};