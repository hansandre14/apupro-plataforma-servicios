const pool = require('../config/db');

// Registrar un nuevo pago (Yape/Efectivo)
exports.registrarPago = async (req, res) => {
    const { usuario_id, trabajo_id, monto, metodo_pago, codigo_operacion } = req.body;
    try {
        const [result] = await pool.query(
            "INSERT INTO pago (usuario_id, trabajo_id, monto, metodo_pago, codigo_operacion) VALUES (?, ?, ?, ?, ?)",
            [usuario_id, trabajo_id, monto, metodo_pago, codigo_operacion]
        );
        res.status(201).json({ 
            success: true, 
            message: 'Pago registrado y en proceso de validación', 
            pagoId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar el pago' });
    }
};