// src/routes/auth.routes.js
const { Router } = require('express');
const router = Router();
const { 
    renderLoginForm,
    loginUser,
    renderRegisterForm,
    registerUser,
    logoutUser,
    loginAsGuest
} = require('../controllers/auth.controller');

// Muestra el formulario de login en la URL /login
router.get('/login', renderLoginForm);

// Procesa los datos del formulario de login
router.post('/login', loginUser);

// Muestra el formulario de registro en la URL /registro
router.get('/registro', renderRegisterForm);

// Procesa los datos del formulario de registro
router.post('/registro', registerUser);

// Inicia sesión como invitado
router.get('/auth/guest', loginAsGuest);

// Cierra la sesión en la URL /logout
router.get('/logout', logoutUser);

module.exports = router;