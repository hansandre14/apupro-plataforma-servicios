const pool = require('../config/db');

// Obtener todas las ocupaciones para los filtros
exports.getOcupaciones = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM ocupacion");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener ocupaciones' });
    }
};

// Obtener todos los trabajos (Catálogo Público Filtrado)
exports.getTrabajos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, o.nombre AS ocupacion, u.nombre AS empleador_nombre, u.apellido AS empleador_apellido
            FROM trabajo t
            LEFT JOIN ocupacion o ON t.ocupacion_id = o.id
            JOIN usuario u ON t.usuario_id = u.id
            
            /* 🚀 MAGIA AQUÍ: Excluimos los trabajos que ya fueron tomados por alguien */
            WHERE t.id NOT IN (
                SELECT trabajo_id 
                FROM postulacion 
                WHERE estado IN ('aceptado', 'verificado', 'finalizado')
            )
            
            ORDER BY t.fecha_publicacion DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error al obtener catálogo:", error);
        res.status(500).json({ success: false, message: 'Error al obtener los trabajos' });
    }
};

// 🚀 FUNCIÓN NORMALIZADA (3NF): Crear un nuevo trabajo (Empleador)
exports.crearTrabajo = async (req, res) => {
    // Ya no recibimos 'empresa', solo los datos puros del trabajo
    const { titulo, ubicacion, salario, usuario_id } = req.body;
    try {
        const [result] = await pool.query(
            "INSERT INTO trabajo (titulo, ubicacion, salario, usuario_id) VALUES (?, ?, ?, ?)", 
            [titulo, ubicacion, salario, usuario_id]
        );
        res.status(201).json({ success: true, message: 'Trabajo creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error("❌ Error al guardar el trabajo en la BD:", error);
        res.status(500).json({ success: false, message: 'Error interno al crear el servicio' });
    }
};
//  OBTENER, EDITAR Y ELIMINAR MIS TRABAJOS
exports.getMisTrabajos = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM trabajo WHERE usuario_id = ? ORDER BY fecha_publicacion DESC", [usuario_id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener tus trabajos' });
    }
};

exports.actualizarTrabajo = async (req, res) => {
    const { id } = req.params;
    const { titulo, ubicacion, salario } = req.body;
    try {
        await pool.query("UPDATE trabajo SET titulo = ?, ubicacion = ?, salario = ? WHERE id = ?", [titulo, ubicacion, salario, id]);
        res.json({ success: true, message: 'Anuncio actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar' });
    }
};

exports.eliminarTrabajo = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM trabajo WHERE id = ?", [id]);
        res.json({ success: true, message: 'Anuncio eliminado correctamente' });
    } catch (error) {
        // Si da error es porque MySQL protege trabajos que ya tienen postulantes
        res.status(500).json({ success: false, message: 'No se puede eliminar un anuncio que ya tiene propuestas activas.' });
    }
};