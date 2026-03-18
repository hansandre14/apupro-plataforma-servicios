const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require('fs'); 
require("dotenv").config();

const app = express();

const uploadDir = path.join(__dirname, 'almacen_archivos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Carpeta 'almacen_archivos' verificada.");
}

const db = require("./src/config/db"); 
const authRoutes = require("./src/routes/authRoutes");
const trabajoRoutes = require("./src/routes/trabajoRoutes");

app.use(cors());
app.use(express.json());
app.use("/almacen_archivos", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix);
  }
});

const uploadMiddleware = multer({ storage: storage }).fields([
    { name: 'foto', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'voucher', maxCount: 1 } 
]);

app.post("/api/usuarios/:id/archivos", (req, res) => {
    console.log("--------------------------------------------------");
    console.log("📥 Recibiendo petición de guardado para ID:", req.params.id);

    uploadMiddleware(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("❌ ERROR EXCLUSIVO DE MULTER:", err);
            return res.status(500).json({ success: false, message: "Error al leer archivo", error: err.message });
        } else if (err) {
            console.error("❌ ERROR DESCONOCIDO AL SUBIR:", err);
            return res.status(500).json({ success: false, message: "Error interno", error: err.message });
        }

        console.log("📦 Archivos procesados. Foto:", req.files?.foto ? "Sí" : "No", "| CV:", req.files?.cv ? "Sí" : "No");

        const usuarioId = req.params.id;
        const archivos = req.files;
        const biografia = req.body.biografia;

        let updateFields = [];
        let values = [];
        let responseData = {};

        if (archivos && archivos.foto) {
            const fotoUrl = `http://localhost:${process.env.PORT || 3000}/almacen_archivos/${archivos.foto[0].filename}`;
            updateFields.push("foto = ?");
            values.push(fotoUrl);
            responseData.foto = fotoUrl;
        }

        if (archivos && archivos.cv) {
            const cvUrl = `http://localhost:${process.env.PORT || 3000}/almacen_archivos/${archivos.cv[0].filename}`;
            updateFields.push("cv = ?");
            values.push(cvUrl);
            responseData.cv = cvUrl;
        }

        if (biografia) {
            updateFields.push("biografia = ?");
            values.push(biografia);
            responseData.biografia = biografia;
        }

        if (updateFields.length === 0) {
            console.log("⚠️ No se enviaron archivos ni biografía para actualizar.");
            return res.status(400).json({ success: false, message: "No se enviaron datos" });
        }

        values.push(usuarioId);
        const sql = `UPDATE usuario SET ${updateFields.join(", ")} WHERE id = ?`;

        console.log("💾 Intentando guardar en MySQL...");
        
        try {
            const resultadoQuery = db.query(sql, values, (err, result) => {
                if (err) {
                    console.error("❌ Error en MySQL (Callback):", err);
                    if (!res.headersSent) return res.status(500).json({ success: false, error: "Error de BD" });
                } else {
                    console.log("✅ ¡Guardado exitoso (Callback)!");
                    if (!res.headersSent) return res.json({ success: true, datosActualizados: responseData });
                }
            });

            if (resultadoQuery && typeof resultadoQuery.then === 'function') {
                resultadoQuery.then(() => {
                    console.log("✅ ¡Guardado exitoso (Promesa)!");
                    if (!res.headersSent) return res.json({ success: true, datosActualizados: responseData });
                }).catch((err) => {
                    console.error("❌ Error en MySQL (Promesa):", err);
                    if (!res.headersSent) return res.status(500).json({ success: false, error: "Error de BD" });
                });
            }
        } catch (errorFatal) {
            console.error("❌ Falla crítica al conectar con DB:", errorFatal);
            if (!res.headersSent) res.status(500).json({ success: false, error: errorFatal.message });
        }
    });
});

app.post("/api/pagos/:postulacion_id/voucher", (req, res) => {
    uploadMiddleware(req, res, function (err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!req.files || !req.files.voucher) return res.status(400).json({ success: false, message: "No foto" });

        const postulacion_id = req.params.postulacion_id;
        const voucherUrl = `http://localhost:${process.env.PORT || 3000}/almacen_archivos/${req.files.voucher[0].filename}`;
        const sql = "UPDATE pago SET voucher_url = ? WHERE postulacion_id = ?";

        try {
            const resultadoQuery = db.query(sql, [voucherUrl, postulacion_id], (err, result) => {
                if (err) return res.status(500).json({ success: false, error: "Error BD" });
                if (!res.headersSent) return res.json({ success: true, voucherUrl });
            });
            if (resultadoQuery && typeof resultadoQuery.then === 'function') {
                resultadoQuery.then(() => { if (!res.headersSent) return res.json({ success: true, voucherUrl }); })
                .catch(err => { if (!res.headersSent) return res.status(500).json({ success: false, error: "Error BD" }); });
            }
        } catch (errorFatal) {
            if (!res.headersSent) res.status(500).json({ success: false, error: errorFatal.message });
        }
    });
});

app.put("/api/pagos/:postulacion_id/verificar", (req, res) => {
    const postulacion_id = req.params.postulacion_id;
    
    const sqlPago = "UPDATE pago SET estado = 'verificado' WHERE postulacion_id = ?";
    const sqlPostulacion = "UPDATE postulacion SET estado = 'verificado' WHERE id = ?";
    
    try {
        const resultadoQuery = db.query(sqlPago, [postulacion_id], (err, result) => {
            if (err) {
                if (!res.headersSent) return res.status(500).json({ success: false, message: "Error BD en pago" });
            } else {
                db.query(sqlPostulacion, [postulacion_id], (err2, result2) => {
                    if (!res.headersSent) return res.json({ success: true });
                });
            }
        });

        if (resultadoQuery && typeof resultadoQuery.then === 'function') {
            resultadoQuery.then(() => {
                return db.query(sqlPostulacion, [postulacion_id]);
            }).then(() => {
                if (!res.headersSent) return res.json({ success: true });
            }).catch(() => {
                if (!res.headersSent) return res.status(500).json({ success: false, message: "Error BD en postulacion" });
            });
        }
    } catch (errorFatal) { 
        if (!res.headersSent) res.status(500).json({ success: false }); 
    }
});

app.post("/api/postulaciones/:postulacion_id/resena", (req, res) => {
    const postulacion_id = req.params.postulacion_id;
    const { cliente_id, especialista_id, puntuacion, comentario } = req.body;

    const sqlResena = "INSERT INTO resena (postulacion_id, cliente_id, especialista_id, puntuacion, comentario) VALUES (?, ?, ?, ?, ?)";

    try {
        const resultResena = db.query(sqlResena, [postulacion_id, cliente_id, especialista_id, puntuacion, comentario], (err, result) => {
            if (err) {
                console.error("❌ Error al guardar reseña:", err);
                if (!res.headersSent) return res.status(500).json({ success: false, error: "Error al guardar reseña" });
            } else {
                if (!res.headersSent) return res.json({ success: true, message: "¡Trabajo finalizado!" });
            }
        });

        if (resultResena && typeof resultResena.then === 'function') {
            resultResena.then(() => { 
                if (!res.headersSent) return res.json({ success: true }); 
            }).catch(err => { 
                if (!res.headersSent) return res.status(500).json({ success: false }); 
            });
        }
    } catch (errorFatal) {
        if (!res.headersSent) res.status(500).json({ success: false });
    }
});

app.get("/api/usuarios/:id/reputacion", (req, res) => {
    const especialista_id = req.params.id;
    
    const sql = `
        SELECT 
            COUNT(id) as total_resenas, 
            IFNULL(AVG(puntuacion), 0) as promedio 
        FROM resena 
        WHERE especialista_id = ?
    `;
    
    try {
        const resultQuery = db.query(sql, [especialista_id], (err, result) => {
            if (err) {
                if (!res.headersSent) return res.status(500).json({ success: false, error: "Error BD" });
            } else {
                if (!res.headersSent) return res.json({ success: true, data: result[0] });
            }
        });

        if (resultQuery && typeof resultQuery.then === 'function') {
            resultQuery.then(([rows]) => {
                if (!res.headersSent) return res.json({ success: true, data: rows[0] });
            }).catch(err => {
                if (!res.headersSent) return res.status(500).json({ success: false });
            });
        }
    } catch (error) {
        if (!res.headersSent) res.status(500).json({ success: false });
    }
});

app.get("/api/usuarios/:id/resenas-detalle", (req, res) => {
    const especialista_id = req.params.id;
    
    const sql = `
        SELECT r.puntuacion, r.comentario, r.fecha_creacion, 
               u.nombre AS cliente_nombre, u.apellido AS cliente_apellido
        FROM resena r
        JOIN usuario u ON r.cliente_id = u.id
        WHERE r.especialista_id = ?
        ORDER BY r.fecha_creacion DESC
    `;
    
    try {
        const resultQuery = db.query(sql, [especialista_id], (err, result) => {
            if (err) {
                if (!res.headersSent) return res.status(500).json({ success: false, error: "Error BD" });
            } else {
                if (!res.headersSent) return res.json({ success: true, data: result });
            }
        });

        if (resultQuery && typeof resultQuery.then === 'function') {
            resultQuery.then(([rows]) => {
                if (!res.headersSent) return res.json({ success: true, data: rows });
            }).catch(err => {
                if (!res.headersSent) return res.status(500).json({ success: false });
            });
        }
    } catch (error) {
        if (!res.headersSent) res.status(500).json({ success: false });
    }
}); 

// ==========================================================
// 🚀 NUEVA RUTA: OBTENER OCUPACIONES PARA AUTOCOMPLETADO
// ==========================================================
app.get("/api/ocupaciones", async (req, res) => {
    try {
        const [result] = await db.query("SELECT * FROM ocupacion ORDER BY nombre ASC");
        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Error obteniendo ocupaciones:", error);
        res.status(500).json({ success: false });
    }
});

// ==========================================================
// 👑 SPRINT 8 - PARTE 2: PANEL DE ADMINISTRADOR (MODO DIOS)
// ==========================================================
app.get("/api/admin/stats", async (req, res) => {
    try {
        const [usuarios] = await db.query("SELECT COUNT(*) as total FROM usuario");
        const [trabajos] = await db.query("SELECT COUNT(*) as total FROM trabajo");
        const [dinero] = await db.query("SELECT IFNULL(SUM(monto), 0) as total FROM pago WHERE estado = 'verificado'");

        res.json({
            success: true,
            data: {
                total_usuarios: usuarios[0].total,
                total_trabajos: trabajos[0].total,
                dinero_movido: dinero[0].total
            }
        });
    } catch (error) { 
        console.error("❌ Error cargando estadísticas del Admin:", error);
        res.status(500).json({ success: false }); 
    }
});

app.get("/api/admin/usuarios", async (req, res) => {
    try {
        const [result] = await db.query("SELECT id, nombre, apellido, email, telefono, dni FROM usuario ORDER BY id DESC");
        res.json({ success: true, data: result });
    } catch (error) { 
        console.error("❌ Error cargando usuarios del Admin:", error);
        res.status(500).json({ success: false }); 
    }
});

app.delete("/api/admin/usuarios/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM usuario WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: "Usuario baneado exitosamente." });
    } catch (error) { 
        console.error("❌ Error al banear usuario:", error);
        res.status(500).json({ success: false, message: "No se puede eliminar un usuario con trabajos activos." }); 
    }
});

app.use("/api", authRoutes);
app.use("/api/trabajos", trabajoRoutes);

app.get("/", (req, res) => res.send("✅ Backend OK"));

app.use((err, req, res, next) => {
    console.error("💥 ERROR GLOBAL CAPTURADO:", err);
    res.status(500).json({ success: false, message: "Falla general del servidor", error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Hans Andre corriendo en puerto ${PORT}`);
});