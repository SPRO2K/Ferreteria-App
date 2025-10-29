// src/controllers/proveedor.controller.js
const pool = require('../config/database');

const renderProveedorDashboard = async (req, res, next) => {
    try {
        const [proveedorLink] = await pool.query("SELECT id_proveedor FROM proveedores WHERE id_usuario = ?", [req.session.user.id]);
        if (proveedorLink.length === 0) {
            const error = new Error('Esta cuenta no está enlazada a un proveedor.');
            throw error;
        }
        
        const proveedorId = proveedorLink[0].id_proveedor;

        // 1. Buscamos las órdenes pendientes asignadas a este proveedor
        const [ordenes] = await pool.query(
            `SELECT * FROM ordenes_compra WHERE id_proveedor = ? AND estado = 'Pendiente' ORDER BY fecha_creacion DESC`,
            [proveedorId]
        );

        // --- LÓGICA MEJORADA ---
        // 2. Para cada orden, buscamos sus productos detallados
        for (const orden of ordenes) {
            const [detalles] = await pool.query(
                `SELECT d.cantidad_solicitada, p.nombre as producto_nombre
                 FROM detalle_ordenes_compra d
                 JOIN productos p ON d.id_producto = p.id_producto
                 WHERE d.id_orden = ?`,
                [orden.id_orden]
            );
            orden.detalles = detalles; // Añadimos la lista de productos a cada objeto de orden
        }
        
        res.render('proveedor/dashboard', { title: 'Mis Órdenes de Compra', ordenes });
    } catch (error) {
        next(error);
    }
};

const markAsShipped = async (req, res, next) => {
    try {
        const { id_orden } = req.body;
        await pool.query("UPDATE ordenes_compra SET estado = 'Enviada' WHERE id_orden = ?", [id_orden]);
        res.redirect('/proveedor');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    renderProveedorDashboard,
    markAsShipped
};