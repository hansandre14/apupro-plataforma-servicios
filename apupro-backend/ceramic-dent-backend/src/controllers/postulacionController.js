const pool = require('../config/db');

// Enviar una solicitud (Propuesta) a un servicio
exports.postular = async (req, res) => {
    const { usuario_id, trabajo_id, mensaje } = req.body; 
    
    try {
        const [existente] = await pool.query("SELECT * FROM postulacion WHERE usuario_id = ? AND trabajo_id = ?", [usuario_id, trabajo_id]);
        if (existente.length > 0) {
            return res.status(400).json({ success: false, message: 'Ya has enviado una propuesta para este servicio' });
        }

        const [result] = await pool.query(
            "INSERT INTO postulacion (usuario_id, trabajo_id, mensaje, estado) VALUES (?, ?, ?, 'pendiente')", 
            [usuario_id, trabajo_id, mensaje || 'Sin mensaje adicional']
        );
        
        res.status(201).json({ success: true, message: 'Propuesta enviada correctamente', postulacionId: result.insertId });
    } catch (error) {
        console.error("Error en postular:", error);
        res.status(500).json({ success: false, message: 'Error al enviar la solicitud' });
    }
};

// 🚀 ACTUALIZADO SPRINT 5: Ver propuestas del Especialista (con estado dinámico)
exports.getMisPostulaciones = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id, 
                p.usuario_id, 
                p.trabajo_id, 
                p.mensaje, 
                p.fecha_postulacion,
                t.titulo, 
                t.ubicacion, 
                t.salario,
                pa.voucher_url, 
                pa.estado AS estado_pago, 
                pa.id AS pago_id,
                -- 🚀 MAGIA SQL: Calculamos el estado real
                CASE 
                    WHEN r.id IS NOT NULL THEN 'finalizado'
                    WHEN pa.estado = 'verificado' THEN 'verificado'
                    ELSE p.estado 
                END AS estado
            FROM postulacion p
            JOIN trabajo t ON p.trabajo_id = t.id
            LEFT JOIN pago pa ON pa.postulacion_id = p.id
            LEFT JOIN resena r ON r.postulacion_id = p.id
            WHERE p.usuario_id = ?
            ORDER BY p.fecha_postulacion DESC
        `, [usuario_id]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error en getMisPostulaciones:", error);
        res.status(500).json({ success: false, message: 'Error al obtener tus solicitudes' });
    }
};

// FASE 1 SPRINT 4: El "Match" Inteligente
exports.actualizarEstadoSolicitud = async (req, res) => {
    const postulacion_id = req.params.id;
    const estado = req.body.estado.toLowerCase(); 

    if (estado === 'rechazado') {
        try {
            await pool.query("UPDATE postulacion SET estado = 'rechazado' WHERE id = ?", [postulacion_id]);
            return res.json({ success: true, message: 'Propuesta rechazada.' });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error al rechazar la propuesta' });
        }
    }

    const connection = await pool.getConnection(); 
    try {
        await connection.beginTransaction();

        await connection.query("UPDATE postulacion SET estado = 'aceptado' WHERE id = ?", [postulacion_id]);

        const [datosPostulacion] = await connection.query(`
            SELECT p.trabajo_id, t.salario 
            FROM postulacion p 
            JOIN trabajo t ON p.trabajo_id = t.id 
            WHERE p.id = ?
        `, [postulacion_id]);

        if (datosPostulacion.length === 0) throw new Error("Postulación no encontrada");
        const { trabajo_id, salario } = datosPostulacion[0];

        await connection.query(`
            UPDATE postulacion 
            SET estado = 'rechazado' 
            WHERE trabajo_id = ? AND id != ?
        `, [trabajo_id, postulacion_id]);

        await connection.query(`
            INSERT INTO pago (postulacion_id, monto, metodo_pago, estado) 
            VALUES (?, ?, 'yape', 'pendiente')
        `, [postulacion_id, salario]);

        await connection.commit();
        res.json({ success: true, message: '¡Match exitoso! Especialista contratado.' });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: 'Error interno al procesar el contrato' });
    } finally {
        connection.release();
    }
};

//  Ver especialistas + Sus Estrellas Públicas
exports.getPostulantesParaEmpleador = async (req, res) => {
    const empleador_id = req.params.empleador_id;
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id AS postulacion_id, 
                p.mensaje,
                p.fecha_postulacion,
                u.id AS candidato_id, 
                u.nombre, 
                u.apellido, 
                u.email, 
                u.telefono, 
                u.foto, 
                u.cv, 
                u.biografia,
                t.id AS trabajo_id, 
                t.titulo AS trabajo_titulo,
                CASE 
                    WHEN r.id IS NOT NULL THEN 'finalizado'
                    WHEN pa.estado = 'verificado' THEN 'verificado'
                    ELSE p.estado 
                END AS estado,
                -- 🚀 MAGIA SQL: Traemos el promedio de estrellas y total de reseñas del candidato
                (SELECT ROUND(IFNULL(AVG(puntuacion), 0), 1) FROM resena WHERE especialista_id = u.id) AS promedio_estrellas,
                (SELECT COUNT(id) FROM resena WHERE especialista_id = u.id) AS total_resenas
            FROM postulacion p
            JOIN usuario u ON p.usuario_id = u.id
            JOIN trabajo t ON p.trabajo_id = t.id
            LEFT JOIN pago pa ON pa.postulacion_id = p.id
            LEFT JOIN resena r ON r.postulacion_id = p.id
            WHERE t.usuario_id = ? 
            ORDER BY p.fecha_postulacion DESC
        `, [empleador_id]); 

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("❌ Error en getPostulantesParaEmpleador:", error);
        res.status(500).json({ success: false, message: 'Error al obtener la lista de especialistas' });
    }
};