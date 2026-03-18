// src/controllers/personaController.js
const pool = require('../config/db'); 
const Persona = require('../models/Persona'); 

// 1. LISTAR TODOS LOS PACIENTES (Esto es lo que te falta)
exports.listarPacientes = async (req, res) => {
    try {
        // Traemos a todos los que tengan rol 'Paciente'
        const [rows] = await pool.query(
            "SELECT * FROM persona WHERE rol = 'Paciente' ORDER BY fechaRegistro DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error("Error listarPacientes:", error);
        res.status(500).json({ message: "Error al obtener pacientes" });
    }
};

// 2. BUSCAR POR DNI (Ya lo tenías, lo mantenemos)
exports.buscarPorDNI = async (req, res) => {
    const { dni } = req.params;
    try {
        const persona = await Persona.buscarPorDNI(dni);
        if (persona) {
            return res.json(persona);
        } else {
            return res.status(404).json({ message: "Persona no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error del servidor" });
    }
};