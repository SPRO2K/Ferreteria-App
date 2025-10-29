// src/controllers/cart.controller.js (VERSIÓN FINAL Y SEGURA)
const pool = require('../config/database');

/**
 * Función auxiliar para obtener el ID de un carrito existente para un usuario
 * o crear uno nuevo si no existe.
 * @param {number} userId - El ID del usuario.
 * @returns {Promise<number>} El ID del carrito.
 */
const getOrCreateUserCart = async (userId) => {
    // 1. Intentamos encontrar un carrito existente
    const [existingCart] = await pool.query("SELECT id_carrito FROM carritos WHERE id_usuario = ?", [userId]);
    
    // 2. Si ya existe, devolvemos su ID
    if (existingCart.length > 0) {
        return existingCart[0].id_carrito;
    } 
    // 3. Si no existe, creamos uno nuevo
    else {
        const [newCart] = await pool.query("INSERT INTO carritos (id_usuario) VALUES (?)", [userId]);
        return newCart.insertId; // Y devolvemos el ID del carrito recién creado
    }
};

/**
 * Obtiene el contenido del carrito del usuario logueado.
 */
const getCart = async (req, res, next) => {
    try {
        // Si no hay sesión de usuario o es un invitado (ID 0), devuelve un carrito vacío.
        if (!req.session.user || req.session.user.id === 0) {
            return res.json({ cart: [] });
        }
        
        const userId = req.session.user.id;

        // --- CORRECCIÓN DE SEGURIDAD ---
        // Antes de continuar, verificamos si el usuario de la sesión realmente existe en la BD.
        const [userExists] = await pool.query("SELECT id_usuario FROM usuarios WHERE id_usuario = ?", [userId]);
        
        if (userExists.length === 0) {
            // Si el usuario de la sesión es inválido (ej. fue borrado), destruimos la sesión
            // para limpiar las cookies del navegador y devolvemos un carrito vacío.
            req.session.destroy();
            return res.json({ cart: [] });
        }
        // --- FIN DE LA CORRECCIÓN ---

        const cartId = await getOrCreateUserCart(userId);

        const [cartItems] = await pool.query(
            `SELECT p.id_producto as id, p.nombre, p.precio_venta as precio, dc.cantidad as quantity
             FROM detalle_carritos dc
             JOIN productos p ON dc.id_producto = p.id_producto
             WHERE dc.id_carrito = ?`,
            [cartId]
        );
        res.json({ cart: cartItems });
    } catch (error) {
        // Si hay cualquier otro error de base de datos, lo pasamos al manejador de errores de Express
        next(error);
    }
};

/**
 * Añade un producto al carrito del usuario.
 */
const addToCart = async (req, res, next) => {
    try {
        if (!req.session.user || req.session.user.id === 0) {
            return res.status(401).json({ message: 'Debes iniciar sesión para guardar tu carrito.' });
        }
        const userId = req.session.user.id;
        const { id: productId } = req.body;
        const quantityToAdd = 1;
        const cartId = await getOrCreateUserCart(userId);

        const sql = `
            INSERT INTO detalle_carritos (id_carrito, id_producto, cantidad) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE cantidad = cantidad + ?;
        `;
        await pool.query(sql, [cartId, productId, quantityToAdd, quantityToAdd]);
        
        getCart(req, res, next); // Devolvemos el carrito actualizado
    } catch (error) {
        next(error);
    }
};

/**
 * Elimina un producto del carrito del usuario.
 */
const removeFromCart = async (req, res, next) => {
    try {
        if (!req.session.user || req.session.user.id === 0) {
            return res.status(401).json({ message: 'No autorizado.' });
        }
        const userId = req.session.user.id;
        const { id: productId } = req.params;
        const cartId = await getOrCreateUserCart(userId);

        await pool.query("DELETE FROM detalle_carritos WHERE id_carrito = ? AND id_producto = ?", [cartId, productId]);
        
        getCart(req, res, next); // Devolvemos el carrito actualizado
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart
};