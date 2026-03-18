const express = require('express');
const router = express.Router();

// IMPORTACIONES DE TODOS TUS CONTROLADORES
const { login, registrar } = require('../controllers/authController');
const { consultarDNI } = require('../controllers/reniecController');
const { getTrabajos, crearTrabajo, getOcupaciones } = require('../controllers/trabajoController');
// ✅ CORRECCIÓN: Todo en una sola línea, sin duplicados
const { postular, getMisPostulaciones, actualizarEstadoSolicitud, getPostulantesParaEmpleador } = require('../controllers/postulacionController');
const { registrarPago } = require('../controllers/pagoController');

// --- SPRINT 1: AUTENTICACIÓN Y RENIEC ---
router.post('/login', login);
router.post('/registro', registrar);
router.post('/reniec', consultarDNI);

// --- SPRINT 2: CATÁLOGO Y OPCIONES ---
router.get('/ocupaciones', getOcupaciones);
router.get('/trabajos', getTrabajos);
router.post('/trabajos', crearTrabajo);

// --- SPRINT 3: SOLICITUDES ---
router.post('/postulaciones', postular);
router.get('/postulaciones/usuario/:usuario_id', getMisPostulaciones);
router.put('/postulaciones/:id/estado', actualizarEstadoSolicitud);

// ✅ NUEVA RUTA PARA EL EMPLEADOR (Panel de control)
router.get('/empleador/:empleador_id/postulantes', getPostulantesParaEmpleador);

// --- SPRINT 4: PAGOS EN LÍNEA (YAPE/EFECTIVO) ---
router.post('/pagos', registrarPago);

module.exports = router;