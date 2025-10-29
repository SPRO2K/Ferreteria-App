// src/controllers/pos.api.controller.js
const pool = require('../config/database');

const searchProducts = async (req, res, next) => {
    try {
        const { term } = req.query;
        if (!term || term.length < 2) return res.json([]);
        
        // La consulta ahora incluye el stock
        const [products] = await pool.query(
            `SELECT p.id_producto, p.nombre, p.precio_venta, p.codigo_barras, COALESCE(i.stock, 0) as stock
             FROM productos p
             LEFT JOIN inventarios i ON p.id_producto = i.id_producto AND i.id_almacen = 1
             WHERE (p.nombre LIKE ? OR p.codigo_barras LIKE ?) AND p.activo = 1 
             LIMIT 10`,
            [`%${term}%`, `%${term}%`]
        );
        res.json(products);
    } catch (error) {
        next(error);
    }
};

const searchClients = async (req, res, next) => {
    try {
        const { term } = req.query;
        if (!term || term.length < 2) return res.json([]);
        const [clients] = await pool.query( `SELECT u.id_usuario, u.nombre, u.apellido, u.correo FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre = 'Cliente' AND u.nombre LIKE ? LIMIT 10`, [`%${term}%`] );
        res.json(clients);
    } catch (error) { next(error); }
};

const processSale = async (req, res, next) => {
    const { cart, clientId, paymentMethod, total, sucursalId } = req.body;
    const vendedorId = req.session.user.id;
    if (!cart || cart.length === 0 || !clientId || !paymentMethod || !sucursalId) {
        return res.status(400).json({ message: 'Faltan datos para procesar la venta.' });
    }
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        for (const item of cart) {
            const [rows] = await connection.query("SELECT stock FROM inventarios WHERE id_producto = ? FOR UPDATE", [item.id]);
            if (rows.length === 0 || rows[0].stock < item.quantity) {
                throw new Error(`Stock insuficiente para el producto: ${item.nombre}`);
            }
        }
        const [ventaResult] = await connection.query("INSERT INTO ventas (id_cliente_usuario, id_vendedor_usuario, id_sucursal, total, metodo_pago) VALUES (?, ?, ?, ?, ?)", [clientId, vendedorId, sucursalId, total, paymentMethod]);
        const ventaId = ventaResult.insertId;
        const detalleValues = cart.map(item => [ventaId, item.id, item.quantity, item.precio]);
        await connection.query("INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES ?", [detalleValues]);
        for (const item of cart) {
            await connection.query("UPDATE inventarios SET stock = stock - ? WHERE id_producto = ?", [item.quantity, item.id]);
        }
        await connection.commit();
        res.status(201).json({ message: 'Venta procesada exitosamente', ventaId: ventaId });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error al procesar la venta:", error);
        res.status(500).json({ message: error.message || 'Error en el servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    searchProducts,
    searchClients,
    processSale
};