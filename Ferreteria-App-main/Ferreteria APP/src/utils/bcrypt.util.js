// src/utils/bcrypt.util.js
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.error("Error al hashear la contraseña:", error);
        throw error;
    }
};

const comparePassword = async (password, receivedPassword) => {
    try {
        if (typeof password !== 'string' || typeof receivedPassword !== 'string' || !password || !receivedPassword) {
            return false;
        }
        return await bcrypt.compare(password, receivedPassword);
    } catch (error) {
        console.error("Error al comparar la contraseña:", error);
        throw error;
    }
};

module.exports = {
    hashPassword,
    comparePassword
};