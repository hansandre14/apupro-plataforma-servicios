const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTRO (Sprint 1) ---
exports.registrar = async (req, res) => {
    // AÑADIDO: 'direccion' y 'rol' ahora se reciben desde el Frontend
    const { nombre, apellido, dni, email, password, telefono, ocupacionNombre, direccion, rol } = req.body;
    
    // NUEVO (LA SEGUNDA CERRADURA): Si un "hacker" se salta el frontend, el backend lo detiene aquí.
    if (!nombre || !apellido || !dni || !email || !password || !telefono || !direccion) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos los campos obligatorios deben estar llenos.' 
        });
    }

    try {
        // 🚀 A SÚPER CERRADURA: Verificar se o DNI ou o Correo xa existen antes de nada
        const [usuariosExistentes] = await pool.query(
            "SELECT id, dni, email FROM usuario WHERE dni = ? OR email = ?", 
            [dni, email]
        );

        // Se atopamos algún usuario con ese DNI ou Correo, bloqueamos o rexistro
        if (usuariosExistentes.length > 0) {
            const usuarioEncontrado = usuariosExistentes[0];
            if (usuarioEncontrado.dni === dni) {
                return res.status(400).json({ success: false, message: 'Este DNI ya está registrado en otra cuenta.' });
            }
            if (usuarioEncontrado.email === email) {
                return res.status(400).json({ success: false, message: 'Este correo electrónico ya está registrado.' });
            }
        }

        // Se o DNI e correo son únicos, continuamos co proceso normal
        let ocupacion_id = null;
        if (ocupacionNombre && ocupacionNombre.trim() !== "") {
            const [rows] = await pool.query("SELECT id FROM ocupacion WHERE LOWER(nombre) = LOWER(?)", [ocupacionNombre.trim()]);
            if (rows.length > 0) {
                ocupacion_id = rows[0].id;
            } else {
                const [newOc] = await pool.query("INSERT INTO ocupacion (nombre) VALUES (?)", [ocupacionNombre.trim()]);
                ocupacion_id = newOc.insertId;
            }
        }
        
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);
        
        // Insertamos 'direccion' y 'rol' en la tabla
        await pool.query(
            "INSERT INTO usuario (nombre, apellido, dni, email, password, telefono, ocupacion_id, direccion, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [nombre, apellido, dni, email, passwordEncriptada, telefono, ocupacion_id, direccion, rol || 'usuario']
        );
        
        res.status(201).json({ success: true, message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ success: false, message: 'Error al registrar' });
    }
};

// --- LOGIN (Sprint 1) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        const usuario = rows[0];
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

        // Generamos un token
        const token = jwt.sign({ id: usuario.id }, 'clave_secreta_unamba', { expiresIn: '24h' });
        
        // Enviamos TODOS los datos del perfil al Frontend
        res.json({ 
            success: true, 
            message: 'Bienvenido ' + usuario.nombre,
            token,
            usuario: { 
                id: usuario.id, 
                nombre: usuario.nombre, 
                apellido: usuario.apellido,
                dni: usuario.dni,
                email: usuario.email,
                telefono: usuario.telefono,
                direccion: usuario.direccion,
                foto: usuario.foto,          
                cv: usuario.cv,              
                biografia: usuario.biografia, 
                rol: usuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};