const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
    // 1. El portero pide la pulsera (el token viene en las cabeceras HTTP)
    let token = req.header('Authorization');

    // 2. Si no hay pulsera, no entras
    if (!token) {
        return res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere Token.' });
    }

    try {
        // 3. Limpiamos el token (suele venir con la palabra "Bearer " al inicio)
        token = token.replace('Bearer ', '');
        
        // 4. El portero verifica que la pulsera sea original de la UNAMBA
        const verificado = jwt.verify(token, 'clave_secreta_unamba');
        
        // 5. Si es válida, le pasa los datos del usuario a la ruta y te deja pasar
        req.usuario = verificado;
        next(); 
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token expirado o inválido.' });
    }
};