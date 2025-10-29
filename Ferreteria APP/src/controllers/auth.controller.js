// src/controllers/auth.controller.js
const pool = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/bcrypt.util');

const renderLoginForm = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('login', { title: 'Iniciar Sesión', layout: false });
};
const renderRegisterForm = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('register', { title: 'Crear Cuenta', layout: false });
};

const registerUser = async (req, res, next) => {
    try {
        const { nombre, correo, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const newUser = { nombre, correo, password: hashedPassword, id_rol: 5 }; // Rol 5 = Cliente
        const [result] = await pool.query("INSERT INTO usuarios SET ?", [newUser]);
        req.session.user = { id: result.insertId, nombre: newUser.nombre, rol: 'Cliente' };
        res.redirect('/');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.render('register', { error: 'El correo ya está registrado.', layout: false });
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { correo, password } = req.body;
        const [rows] = await pool.query("SELECT u.id_usuario, u.nombre, u.password, u.activo, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE u.correo = ?", [correo]);
        if (rows.length === 0) {
            return res.render('login', { error: 'Correo o contraseña incorrectos.', layout: false });
        }
        
        const user = rows[0];
        const isMatch = await comparePassword(password, user.password);
        
        if (!isMatch || !user.activo) {
            return res.render('login', { error: 'Correo o contraseña incorrectos.', layout: false });
        }

        req.session.user = {
            id: user.id_usuario,
            nombre: user.nombre,
            rol: user.rol_nombre
        };
        
        const userRole = user.rol_nombre.toLowerCase();

        if (userRole === 'administrador') {
            return res.redirect('/dashboard');
        }
        if (userRole === 'vendedor') {
            return res.redirect('/vendedor');
        }
        if (userRole === 'bodeguero') {
            return res.redirect('/bodeguero');
        }
        if (userRole === 'proveedor') { // <-- LÍNEA AÑADIDA
            return res.redirect('/proveedor');
        }
        if (userRole === 'cliente') {
            return res.redirect('/');
        }
        
        req.session.destroy(() => {
            res.render('login', { error: 'Tu rol no tiene una página de inicio asignada.', layout: false });
        });

    } catch (error) {
        next(error);
    }
};

const logoutUser = (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
};

const loginAsGuest = (req, res) => {
    req.session.user = { id: 0, nombre: 'Invitado', rol: 'Cliente' };
    res.redirect('/');
};

module.exports = {
    renderLoginForm,
    loginUser,
    renderRegisterForm,
    registerUser,
    logoutUser,
    loginAsGuest
};