// src/controllers/admin.controller.js
const pool = require('../config/database');
const { hashPassword } = require('../utils/bcrypt.util');

// --- EMPLEADOS ---
const renderEmployeeList = async (req, res, next) => { try { const [e] = await pool.query(`SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE r.nombre != 'Cliente' ORDER BY u.nombre ASC`); res.render('admin/empleados', { title: 'Gestionar Empleados', empleados: e }); } catch (err) { next(err); } };
const renderEmployeeForm = async (req, res, next) => { try { const [r] = await pool.query("SELECT * FROM roles WHERE nombre != 'Cliente'"); res.render('admin/empleado_form', { title: 'Crear Empleado', roles: r }); } catch (err) { next(err); } };
const createEmployee = async (req, res, next) => { const { nombre, apellido, carnet_identidad, correo, telefono, direccion, id_rol, password } = req.body; let conn; try { conn = await pool.getConnection(); await conn.beginTransaction(); const hp = await hashPassword(password); const nu = { nombre, apellido, carnet_identidad, correo, telefono, direccion, id_rol, password: hp }; const [ur] = await conn.query("INSERT INTO usuarios SET ?", [nu]); const nuid = ur.insertId; if (id_rol === '4') { const np = { id_usuario: nuid, nombre, telefono, correo, direccion: direccion || 'N/A' }; await conn.query("INSERT INTO proveedores SET ?", [np]); } await conn.commit(); res.redirect('/admin/empleados'); } catch (err) { if (conn) await conn.rollback(); if (err.code === 'ER_DUP_ENTRY') { const [r] = await pool.query("SELECT * FROM roles WHERE nombre != 'Cliente'"); return res.render('admin/empleado_form', { title: 'Crear Empleado', error: `El correo '${req.body.correo}' ya existe.`, empleado: req.body, roles: r }); } next(err); } finally { if (conn) conn.release(); } };
const renderEditEmployeeForm = async (req, res, next) => { try { const { id } = req.params; const [rows] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id]); const [roles] = await pool.query("SELECT * FROM roles WHERE nombre != 'Cliente'"); if (rows.length === 0) return res.redirect('/admin/empleados'); res.render('admin/empleado_form', { title: 'Editar Empleado', empleado: rows[0], roles, editing: true }); } catch (err) { next(err); } };
const updateEmployee = async (req, res, next) => { try { const { id } = req.params; const { nombre, apellido, carnet_identidad, correo, telefono, direccion, id_rol, activo } = req.body; const isActive = activo === 'on' ? 1 : 0; const ue = { nombre, apellido, carnet_identidad, correo, telefono, direccion, id_rol, activo: isActive }; await pool.query("UPDATE usuarios SET ? WHERE id_usuario = ?", [ue, id]); res.redirect('/admin/empleados'); } catch (err) { if (err.code === 'ER_DUP_ENTRY') return res.redirect(`/admin/empleados/edit/${id}?error=email_in_use`); next(err); } };

// --- ÓRDENES DE COMPRA ---
const renderOrderList = async (req, res, next) => { try { const [o] = await pool.query(`SELECT o.*, p.nombre as proveedor_nombre FROM ordenes_compra o JOIN proveedores p ON o.id_proveedor = p.id_proveedor ORDER BY o.fecha_creacion DESC`); res.render('admin/ordenes_compra', { title: 'Órdenes de Compra', ordenes: o }); } catch (err) { next(err); } };
const renderNewOrderForm = async (req, res, next) => { try { const [p] = await pool.query("SELECT * FROM proveedores"); const [pr] = await pool.query("SELECT id_producto, nombre FROM productos WHERE activo = 1"); res.render('admin/orden_form', { title: 'Nueva Orden de Compra', proveedores: p, productos: pr }); } catch (err) { next(err); } };
const createOrder = async (req, res, next) => { const { id_proveedor } = req.body; const p = [].concat(req.body.productos || []); const c = [].concat(req.body.cantidades || []); const pr = [].concat(req.body.precios || []); const uid = req.session.user.id; let conn; try { if (p.length === 0) throw new Error("No hay productos"); conn = await pool.getConnection(); await conn.beginTransaction(); let te = 0; for(let i=0; i<p.length; i++) { te += parseFloat(c[i]||0) * parseFloat(pr[i]||0); } const [or] = await conn.query("INSERT INTO ordenes_compra (id_proveedor, id_usuario_creador, total_estimado) VALUES (?, ?, ?)", [id_proveedor, uid, te]); const oid = or.insertId; const dv = p.map((pid, i) => [oid, pid, c[i], pr[i]]); await conn.query("INSERT INTO detalle_ordenes_compra (id_orden, id_producto, cantidad_solicitada, precio_compra_unitario) VALUES ?", [dv]); await conn.commit(); res.redirect('/admin/ordenes-compra'); } catch (err) { if (conn) await conn.rollback(); next(err); } finally { if (conn) conn.release(); } };
const renderOrderDetail = async (req, res, next) => { try { const { id } = req.params; const [or] = await pool.query(`SELECT o.*, p.nombre as proveedor_nombre, u.nombre as creador_nombre FROM ordenes_compra o JOIN proveedores p ON o.id_proveedor = p.id_proveedor JOIN usuarios u ON o.id_usuario_creador = u.id_usuario WHERE o.id_orden = ?`, [id]); if (or.length === 0) return res.redirect('/admin/ordenes-compra'); const [d] = await pool.query(`SELECT d.*, p.nombre as producto_nombre FROM detalle_ordenes_compra d JOIN productos p ON d.id_producto = p.id_producto WHERE d.id_orden = ?`, [id]); res.render('admin/orden_detalle', { title: `Detalle Orden #${id}`, orden: or[0], detalles: d }); } catch (err) { next(err); } };

// --- HISTORIAL DE VENTAS (NUEVO) ---
const renderSalesHistory = async (req, res, next) => {
    try {
        const [ventas] = await pool.query(
            `SELECT v.*, cli.nombre as cliente_nombre, vend.nombre as vendedor_nombre
             FROM ventas v
             JOIN usuarios cli ON v.id_cliente_usuario = cli.id_usuario
             JOIN usuarios vend ON v.id_vendedor_usuario = vend.id_usuario
             ORDER BY v.fecha DESC`
        );
        res.render('admin/ventas', { title: 'Historial de Todas las Ventas', ventas });
    } catch (error) {
        next(error);
    }
};
const renderSaleDetailAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [ventaRows] = await pool.query(
            `SELECT v.*, suc.nombre as sucursal_nombre, cli.nombre as cliente_nombre, vend.nombre as vendedor_nombre
             FROM ventas v
             JOIN sucursales suc ON v.id_sucursal = suc.id_sucursal
             JOIN usuarios cli ON v.id_cliente_usuario = cli.id_usuario
             JOIN usuarios vend ON v.id_vendedor_usuario = vend.id_usuario
             WHERE v.id_venta = ?`,
            [id]
        );
        if (ventaRows.length === 0) return res.redirect('/admin/ventas');
        
        const [detalles] = await pool.query(
            `SELECT dv.*, p.nombre as producto_nombre 
             FROM detalle_ventas dv 
             JOIN productos p ON dv.id_producto = p.id_producto 
             WHERE dv.id_venta = ?`,
            [id]
        );
        res.render('admin/venta_detalle_admin', { title: `Detalle Venta #${id}`, venta: ventaRows[0], detalles });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    renderEmployeeList, renderEmployeeForm, createEmployee, renderEditEmployeeForm, updateEmployee,
    renderOrderList, renderNewOrderForm, createOrder, renderOrderDetail,
    renderSalesHistory, renderSaleDetailAdmin
};