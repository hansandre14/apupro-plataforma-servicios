const express = require('express');
const router = express.Router();
const trabajoController = require('../controllers/trabajoController');

// 🚀 IMPORTAMOS EL MIDDLEWARE (EL PORTERO)
const { verificarToken } = require('../middlewares/authMiddleware'); 

// ==========================================
// 🟢 RUTAS PÚBLICAS (No requieren Token)
// ==========================================
// Obtener la lista de ocupaciones
router.get('/ocupaciones', trabajoController.getOcupaciones);
// Obtener todos los trabajos publicados
router.get('/', trabajoController.getTrabajos);


// ==========================================
// 🔴 RUTAS PROTEGIDAS (Requieren Token válido)
// ==========================================
// Publicar un nuevo trabajo (Pedido del Cliente)
router.post('/', verificarToken, trabajoController.crearTrabajo);

// Rutas para el CRUD del Cliente
router.get('/usuario/:usuario_id', verificarToken, trabajoController.getMisTrabajos);
router.put('/:id', verificarToken, trabajoController.actualizarTrabajo);
router.delete('/:id', verificarToken, trabajoController.eliminarTrabajo);

module.exports = router;