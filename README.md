# 🏔️ ApuPro - Plataforma de Servicios y Profesionales

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

ApuPro es un ecosistema digital diseñado para conectar el talento local de manera inteligente y segura. La plataforma permite a los usuarios publicar solicitudes de trabajo y a los especialistas locales enviar propuestas, gestionando todo el ciclo del servicio desde el contacto inicial hasta el pago y la calificación final.

## ✨ Características Principales

* **Autenticación Segura:** Sistema de login y registro protegido con encriptación Bcrypt y JSON Web Tokens (JWT).
* **Validación de Identidad:** Integración para consultar números de DNI (RENIEC) y garantizar una comunidad con identidades reales.
* **Gestión de Perfiles y Reputación:** Sistema de reseñas (1 a 5 estrellas), comentarios y niveles de completitud de perfil (Insignias Pro).
* **Protección de Rutas (Guards):** Control estricto de accesos mediante Angular Guards para evitar navegaciones no autorizadas y manejar los "Tokens fantasma".
* **Panel de Administración:** Dashboard exclusivo con métricas globales, control de transacciones y herramientas de moderación (baneo de usuarios).
* **Subida de Archivos:** Soporte para subir fotos de perfil, portafolios en PDF y vouchers de pago mediante Multer.

## 🛠️ Tecnologías Utilizadas

**Frontend:**
* Angular (Framework principal)
* HTML5 & CSS3 (Diseño moderno con Glassmorphism)
* SweetAlert2 (Alertas e interacciones dinámicas)

**Backend:**
* Node.js & Express.js (Servidor y API REST)
* JWT (Manejo de sesiones)
* Multer (Gestión de archivos)

**Base de Datos:**
* MySQL (Estructura Relacional Normalizada en 3FN)

## 🚀 Instalación y Despliegue Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local.

### 1. Clonar el repositorio
\`\`\`bash
git clone https://github.com/hansandre14/apupro-plataforma-servicios.git
\`\`\`

### 2. Configurar la Base de Datos
1.  Abre tu gestor de MySQL (ej. phpMyAdmin o MySQL Workbench).
2.  Crea una base de datos vacía.
3.  Importa el archivo `.sql` que se encuentra dentro de la carpeta `DATABASE`.

### 3. Configurar el Backend
1.  Abre una terminal y navega a la carpeta del backend:
    \`\`\`bash
    cd apupro-backend
    \`\`\`
2.  Instala las dependencias:
    \`\`\`bash
    npm install
    \`\`\`
3.  Crea un archivo `.env` en la raíz del backend con tus credenciales de base de datos y tu clave secreta JWT.
4.  Inicia el servidor:
    \`\`\`bash
    npm start
    \`\`\`

### 4. Configurar el Frontend
1.  Abre una nueva terminal y navega a la carpeta del frontend:
    \`\`\`bash
    cd apupro-frontend
    \`\`\`
2.  Instala las dependencias:
    \`\`\`bash
    npm install
    \`\`\`
3.  Inicia la aplicación de Angular:
    \`\`\`bash
    ng serve -o
    \`\`\`

    //// CUENTAS DE USUARIO
    USUARIO: yanet@gmail.com
    contraseña: Yanet1234.
    Usuario: patrick@gmail.com
    contraseña: Patrick1234.
    Admin Principal: admin@admin.com
    contraseña: 74042894Andre%
    
La aplicación se abrirá automáticamente en tu navegador en `http://localhost:4200/`.

---
*Desarrollado con 💻 para optimizar la gestión de servicios locales.*
