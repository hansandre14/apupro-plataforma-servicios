const axios = require('axios');

exports.consultarDNI = async (req, res) => {
    const { dni } = req.body;
    // Token de tu API
    const token = 'apis-token-12953.B9MDGaSEwHJRCGhJOALhrXcv3DBSawcC';

    if (!dni || dni.length !== 8) {
        return res.status(400).json({ success: false, message: "DNI inválido" });
    }

    try {
        const response = await axios.get(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = response.data;
        // Juntamos ambos apellidos para el campo "apellido" de tu tabla
        const apellidosJuntos = `${data.apellidoPaterno} ${data.apellidoMaterno}`;

        res.json({ 
            success: true, 
            nombre: data.nombres,
            apellido: apellidosJuntos,
            data: data 
        });

    } catch (error) {
        console.error("Error API RENIEC:", error.message);
        res.status(404).json({ success: false, message: "DNI no encontrado o error de servicio." });
    }
};