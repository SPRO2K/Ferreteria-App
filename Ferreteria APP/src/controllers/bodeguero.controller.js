// src/controllers/bodeguero.controller.js
const pool = require('../config/database');

/**
 * Muestra el dashboard principal del bodeguero, enfocado en las órdenes
 * que están listas para ser recibidas (estado 'Enviada').
 * También carga los productos detallados de cada orden, incluyendo su imagen.
 */
const renderBodegueroDashboard = async (req, res, next) => {
    try {
        const [ordenes] = await pool.query(
            `SELECT o.*, p.nombre as proveedor_nombre 
             FROM ordenes_compra o 
             JOIN proveedores p ON o.id_proveedor = p.id_proveedor 
             WHERE o.estado = 'Enviada' 
             ORDER BY o.fecha_creacion ASC`
        );

        // Para cada orden encontrada, buscamos sus productos para mostrarlos en el detalle.
        for (const orden of ordenes) {
            // CORRECCIÓN: Ahora también seleccionamos p.imagen
            const [detalles] = await pool.query(
                `SELECT d.cantidad_solicitada, p.nombre as producto_nombre, p.imagen
                 FROM detalle_ordenes_compra d 
                 JOIN productos p ON d.id_producto = p.id_producto 
                 WHERE d.id_orden = ?`, 
                [orden.id_orden]
            );
            orden.detalles = detalles;
        }

        res.render('bodeguero/dashboard', { 
            title: 'Recepción de Mercancía', 
            ordenes,
            isRecepcion: true // Bandera para activar la pestaña correcta en la vista
        });
    } catch (error) { 
        next(error); 
    }
};

/**
 * Muestra la página de inventario general, con el stock de todos los productos.
 */
const renderInventario = async (req, res, next) => {
    try {
        const sql = `
            SELECT 
                p.id_producto, 
                p.nombre,
                COALESCE(i.stock, 0) as stock, 
                COALESCE(i.stock_minimo, 10) as stock_minimo
            FROM productos p
            LEFT JOIN inventarios i ON p.id_producto = i.id_producto AND i.id_almacen = 1
            ORDER BY p.nombre ASC
        `;
        const [inventario] = await pool.query(sql);
        
        res.render('bodeguero/dashboard', { 
            title: 'Gestión de Inventario', 
            inventario,
            isInventario: true // Bandera para activar la pestaña correcta en la vista
        });
    } catch (error) { 
        next(error); 
    }
};

/**
 * Procesa la recepción de una orden: actualiza el stock y el estado de la orden.
 */
const receiveOrder = async (req, res, next) => {
    const { id_orden } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [detalles] = await connection.query("SELECT * FROM detalle_ordenes_compra WHERE id_orden = ?", [id_orden]);

        for (const item of detalles) {
            const sql = `
                INSERT INTO inventarios (id_producto, id_almacen, stock) VALUES (?, 1, ?)
                ON DUPLICATE KEY UPDATE stock = stock + VALUES(stock);
            `;
            await connection.query(sql, [item.id_producto, item.cantidad_solicitada]);
        }

        await connection.query(
            "UPDATE ordenes_compra SET estado = 'Recibida', fecha_recepcion = NOW() WHERE id_orden = ?", 
            [id_orden]
        );

        await connection.commit();
        res.redirect('/bodeguero');

    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

/**
 * Actualiza manually el stock de un producto en el inventario.
 */
const updateStock = async (req, res, next) => {
    try {
        const { id_producto, stock } = req.body;
        const sql = `
            INSERT INTO inventarios (id_producto, id_almacen, stock) 
            VALUES (?, 1, ?) 
            ON DUPLICATE KEY UPDATE stock = VALUES(stock);
        `;
        await pool.query(sql, [id_producto, stock]);
        res.redirect('/bodeguero/inventario');
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    renderBodegueroDashboard,
    renderInventario,
    receiveOrder, 
    updateStock 
};