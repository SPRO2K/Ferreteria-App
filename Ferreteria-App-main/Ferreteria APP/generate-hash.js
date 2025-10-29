// generate-hash.js
const { hashPassword } = require('./src/utils/bcrypt.util');
const generate = async () => {
    const password = '12345';
    const hash = await hashPassword(password);
    console.log("HASH BCRYPTJS GENERADO:");
    console.log(hash);
};
generate();