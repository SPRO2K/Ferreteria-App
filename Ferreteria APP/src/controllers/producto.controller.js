// src/controllers/producto.controller.js
const pool = require('../config/database');

// --- CRUD DE PRODUCTOS (CREATE, READ, UPDATE, DELETE) ---

const renderProductList = async (req, res, next) => {
    try {
        const [productos] = await pool.query(`SELECT p.*, c.nombre as categoria_nombre, m.nombre as marca_nombre FROM productos p JOIN categorias c ON p.id_categoria = c.id_categoria JOIN marcas m ON p.id_marca = m.id_marca ORDER BY p.id_producto DESC`);
        // Recogemos el mensaje de error de la URL si existe, para mostrarlo en la vista
        res.render('admin/productos', { title: 'Gestionar Productos', productos, error: req.query.error });
    } catch (error) {
        next(error);
    }
};

const renderAddProductForm = async (req, res, next) => {
    try {
        const [categorias] = await pool.query("SELECT * FROM categorias");
        const [marcas] = await pool.query("SELECT * FROM marcas");
        const [unidades] = await pool.query("SELECT * FROM unidades_medida");
        res.render('admin/producto_form', { title: 'Añadir Producto', categorias, marcas, unidades });
    } catch (error) {
        next(error);
    }
};

const addProduct = async (req, res, next) => {
    let connection;
    try {
        const { nombre, codigo_barras, descripcion, imagen, precio_compra, precio_venta, id_categoria, id_marca, id_unidad, stock_inicial, stock_minimo } = req.body;
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const productData = { nombre, codigo_barras, descripcion, imagen, precio_compra, precio_venta, id_categoria, id_marca, id_unidad, activo: req.body.activo === '1' ? 1 : 0 };
        const [productResult] = await connection.query("INSERT INTO productos SET ?", [productData]);
        const newProductId = productResult.insertId;
        const inventoryData = { id_producto: newProductId, id_almacen: 1, stock: stock_inicial, stock_minimo };
        await connection.query("INSERT INTO inventarios SET ?", [inventoryData]);
        await connection.commit();
        res.redirect('/productos');
    } catch (error) {
        if (connection) await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            const [categorias] = await pool.query("SELECT * FROM categorias");
            const [marcas] = await pool.query("SELECT * FROM marcas");
            const [unidades] = await pool.query("SELECT * FROM unidades_medida");
            return res.render('admin/producto_form', { title: 'Añadir Producto', error: `El código de barras '${req.body.codigo_barras}' ya está en uso.`, producto: req.body, categorias, marcas, unidades });
        }
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

const renderEditProductForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [id]);
        if (rows.length === 0) return res.redirect('/productos');
        const producto = rows[0];
        const [categorias] = await pool.query("SELECT * FROM categorias");
        const [marcas] = await pool.query("SELECT * FROM marcas");
        const [unidades] = await pool.query("SELECT * FROM unidades_medida");
        res.render('admin/producto_form', { title: 'Editar Producto', producto, categorias, marcas, unidades, editing: true });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        const productData = req.body;
        let activoValue = Array.isArray(productData.activo) ? productData.activo[0] : productData.activo;
        productData.activo = (activoValue === '1') ? 1 : 0;
        await pool.query("UPDATE productos SET ? WHERE id_producto = ?", [productData, id]);
        res.redirect('/productos');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const [categorias] = await pool.query("SELECT * FROM categorias");
            const [marcas] = await pool.query("SELECT * FROM marcas");
            const [unidades] = await pool.query("SELECT * FROM unidades_medida");
            const productoConError = { ...req.body, id_producto: id };
            res.render('admin/producto_form', { title: 'Editar Producto', error: `El código de barras '${req.body.codigo_barras}' ya está en uso.`, producto: productoConError, categorias, marcas, unidades, editing: true });
        } else {
            next(error);
        }
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        // BORRADO FÍSICO Y PERMANENTE
        await pool.query("DELETE FROM productos WHERE id_producto = ?", [id]);
        res.redirect('/productos');
    } catch (error) {
        // MANEJO DE ERROR DE CLAVE FORÁNEA
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            const errorMessage = encodeURIComponent(`Error: El producto ID ${req.params.id} no se puede borrar porque tiene historial asociado (ventas, carritos, etc.).`);
            return res.redirect(`/productos?error=${errorMessage}`);
        }
        next(error);
    }
};

// --- GESTIÓN DE OFERTAS ---
const renderOffersList = async (req, res, next) => {
    try {
        const [ofertas] = await pool.query("SELECT id_producto, nombre, imagen, precio_venta, precio_oferta FROM productos WHERE es_oferta = 1");
        const [noOfertas] = await pool.query("SELECT id_producto, nombre FROM productos WHERE es_oferta = 0 AND activo = 1 ORDER BY nombre ASC");
        res.render('admin/ofertas', { title: 'Gestionar Ofertas', ofertas, noOfertas });
    } catch (error) { next(error); }
};
const addOffer = async (req, res, next) => {
    try {
        const { id_producto, precio_oferta } = req.body;
        if (id_producto && precio_oferta) {
            await pool.query("UPDATE productos SET es_oferta = 1, precio_oferta = ? WHERE id_producto = ?", [precio_oferta, id_producto]);
        }
        res.redirect('/productos/ofertas');
    } catch (error) { next(error); }
};
const removeOffer = async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE productos SET es_oferta = 0, precio_oferta = NULL WHERE id_producto = ?", [id]);
        res.redirect('/productos/ofertas');
    } catch (error) { next(error); }
};

module.exports = {
    renderProductList, renderAddProductForm, addProduct, renderEditProductForm, updateProduct,
    deleteProduct, renderOffersList, addOffer, removeOffer
};