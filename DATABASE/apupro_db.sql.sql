-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-03-2026 a las 18:31:10
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `proyectoagiles`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ocupacion`
--

CREATE TABLE `ocupacion` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ocupacion`
--

INSERT INTO `ocupacion` (`id`, `nombre`) VALUES
(1, 'Albañilería'),
(6, 'Carpintería'),
(10, 'Catador de caña'),
(2, 'Electricidad'),
(3, 'Gasfitería'),
(8, 'Jardinería'),
(5, 'Limpieza'),
(7, 'Pintura'),
(4, 'Servicio Técnico'),
(9, 'Tecnología y Redes');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id` bigint(20) NOT NULL,
  `postulacion_id` bigint(20) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime DEFAULT current_timestamp(),
  `metodo_pago` enum('yape','efectivo') NOT NULL,
  `voucher_url` varchar(255) DEFAULT NULL,
  `codigo_operacion` varchar(50) DEFAULT NULL,
  `estado` enum('pendiente','verificado','rechazado') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`id`, `postulacion_id`, `monto`, `fecha_pago`, `metodo_pago`, `voucher_url`, `codigo_operacion`, `estado`) VALUES
(1, 3, 50.00, '2026-03-14 11:22:10', 'yape', NULL, NULL, 'pendiente'),
(2, 3, 50.00, '2026-03-14 11:22:48', 'yape', NULL, NULL, 'pendiente'),
(3, 4, 50.00, '2026-03-14 11:28:03', 'yape', NULL, NULL, 'pendiente'),
(4, 1, 50.00, '2026-03-14 11:28:15', 'yape', 'http://localhost:3000/almacen_archivos/1773524124440-WhatsApp_Image_2023-08-24_at_3.58.39_PM.jpeg', NULL, 'verificado'),
(5, 2, 50.00, '2026-03-14 11:34:10', 'yape', 'http://localhost:3000/almacen_archivos/1773527163091-WhatsApp_Image_2023-08-01_at_11.29.04_PM.jpeg', NULL, 'verificado'),
(6, 5, 100.00, '2026-03-14 17:28:14', 'yape', 'http://localhost:3000/almacen_archivos/1773530605621-WhatsApp_Image_2023-08-01_at_11.29.04_PM.jpeg', NULL, 'verificado'),
(7, 6, 10.00, '2026-03-16 20:49:41', 'yape', 'http://localhost:3000/almacen_archivos/1773712200725-snoopy.jpg', NULL, 'verificado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `postulacion`
--

CREATE TABLE `postulacion` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `trabajo_id` bigint(20) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `fecha_postulacion` datetime DEFAULT current_timestamp(),
  `estado` enum('pendiente','aceptado','rechazado','implementando') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `postulacion`
--

INSERT INTO `postulacion` (`id`, `usuario_id`, `trabajo_id`, `mensaje`, `fecha_postulacion`, `estado`) VALUES
(1, 7, 1, 'sghdiuasgdhuagsd', '2026-03-12 23:16:29', 'aceptado'),
(2, 7, 2, 'ashgdhiasgdyihasd', '2026-03-14 11:14:32', 'aceptado'),
(3, 10, 2, 'sdadzczxcvr321', '2026-03-14 11:20:55', 'rechazado'),
(4, 10, 1, 'asdasdasdad', '2026-03-14 11:27:48', 'rechazado'),
(5, 10, 3, 'gvzxjhcvjzhfcvugsdxc', '2026-03-14 17:27:39', 'aceptado'),
(6, 7, 5, 'LImpieza de todo hogar', '2026-03-16 20:47:41', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resena`
--

CREATE TABLE `resena` (
  `id` int(11) NOT NULL,
  `postulacion_id` bigint(20) DEFAULT NULL,
  `cliente_id` bigint(20) DEFAULT NULL,
  `especialista_id` bigint(20) DEFAULT NULL,
  `puntuacion` int(11) NOT NULL,
  `comentario` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resena`
--

INSERT INTO `resena` (`id`, `postulacion_id`, `cliente_id`, `especialista_id`, `puntuacion`, `comentario`, `fecha_creacion`) VALUES
(1, 1, 10, 7, 4, 'MUY BUEN TRABAJO', '2026-03-14 23:30:09'),
(2, 6, 12, 7, 3, 'buen trabajo, recomendado ', '2026-03-17 01:51:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabajo`
--

CREATE TABLE `trabajo` (
  `id` bigint(20) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT NULL,
  `ubicacion` varchar(150) DEFAULT NULL,
  `fecha_publicacion` datetime DEFAULT current_timestamp(),
  `fecha_cierre` datetime DEFAULT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `ocupacion_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trabajo`
--

INSERT INTO `trabajo` (`id`, `titulo`, `descripcion`, `salario`, `ubicacion`, `fecha_publicacion`, `fecha_cierre`, `usuario_id`, `ocupacion_id`) VALUES
(1, 'Electricista', NULL, 20.00, 'Av 4 de Noviembre', '2026-03-12 23:12:11', NULL, 10, NULL),
(2, 'Albañil', NULL, 50.00, 'av Perú', '2026-03-14 11:14:06', NULL, 1, NULL),
(3, 'Urge servicio tecnico', NULL, 100.00, 'Av Alfonso Ugarte', '2026-03-14 17:17:47', NULL, 1, NULL),
(4, '[Limpieza] Limpieza de vidrios', NULL, 20.00, 'Av Seone ', '2026-03-15 12:20:19', NULL, 7, NULL),
(5, '[Limpieza] Limpieza de hogar', NULL, 10.00, 'Av prado', '2026-03-16 20:42:14', NULL, 12, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(8) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `ocupacion_id` bigint(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `cv` varchar(255) DEFAULT NULL,
  `biografia` text DEFAULT NULL,
  `rol` enum('usuario','Empleador','admin') DEFAULT 'usuario',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `apellido`, `dni`, `email`, `password`, `ocupacion_id`, `fecha_nacimiento`, `telefono`, `direccion`, `foto`, `cv`, `biografia`, `rol`, `created_at`, `updated_at`) VALUES
(1, 'HANS ANDRE', 'PEREZ SEQUEIROS', '74042894', 'hperezsequeiros@gmail.com', '$2b$10$44PQZflnhrzTbrwBHUAOHu6l7/PKDTQfmKbOukxgB3WwvzN/Cz6p6', 1, NULL, '951131970', NULL, 'http://localhost:3000/almacen_archivos/1772127484959-snoopy.jpg', 'http://localhost:3000/almacen_archivos/1772127790252-1._Semana_01_-_GPA_(1).pdf', 'sadasdasdasdasd', 'Empleador', '2026-02-25 14:32:12', '2026-02-26 13:00:57'),
(6, 'MARIA PIA', 'GAMARRA PARRAGA', '74236348', '222184@unamba.edu.pe', '$2b$10$2pKm3NkhgapxqOWm36sJbOJaRloyvl6EbvNghx8vdbsv1cHTRSWF6', 2, NULL, '951131970', NULL, NULL, NULL, NULL, 'usuario', '2026-02-25 14:51:42', '2026-02-25 14:51:42'),
(7, 'YANET', 'QUISPE PALOMINO', '71241156', 'yanet@gmail.com', '$2b$10$J0optNfF1iC8DNHon5tEOekwLSaaheo.as4rXaZpQb5ztn/08UCUi', 3, NULL, '984324516', NULL, 'http://localhost:3000/almacen_archivos/1772129846581-rockme.jpg', 'http://localhost:3000/almacen_archivos/1772129846586-1._Semana_01_-_GPA_(1).pdf', 'aaaaaaaaaaa', 'usuario', '2026-02-26 13:05:10', '2026-03-16 21:42:01'),
(8, 'ALEX MELECIO', 'CASTILLO CORDOVA', '72047251', 'Alex@gmail.com', '$2b$10$fMeyH4Yn4SSusHZV3LR70.Tza6UZdgpXz0uaYaE5n.GAmIvj2ANH6', 4, NULL, '99999999', NULL, NULL, NULL, NULL, 'usuario', '2026-03-12 22:41:14', '2026-03-12 22:41:14'),
(9, 'DIANE YANIDET', 'PANDURO CAMACHO', '72453617', '', '$2b$10$vxDLsQEvTKEKhi5BzqPmO.fNJcFgsPoV0KjDR3JA4iggj9pjeqJZC', NULL, NULL, '', NULL, NULL, NULL, NULL, 'usuario', '2026-03-12 22:46:37', '2026-03-12 22:46:37'),
(10, 'PHATRIK GEORGE', 'TALAVERANO GASTELU', '71342516', 'Patrick@gmail.com', '$2b$10$YqDgRvfJ7TLHmbnZvGOxDucVE68yJmyBtVp6IrhdanetiP2H.3WB6', NULL, NULL, '99999999', 'Jr Lima', NULL, NULL, NULL, 'Empleador', '2026-03-12 22:55:51', '2026-03-12 22:55:51'),
(11, 'Super', 'Administrador', '00000000', 'admin@admin.com', '$2b$10$44PQZflnhrzTbrwBHUAOHu6l7/PKDTQfmKbOukxgB3WwvzN/Cz6p6', NULL, NULL, '999888777', 'Servidor Central', NULL, NULL, NULL, 'usuario', '2026-03-14 19:21:06', '2026-03-14 19:21:06'),
(12, 'RAMIRO DE JESUS', 'MONTES SALAS', '73511092', 'Ramiro@gmail.com', '$2b$10$y/yz5794pVT6s9ZTpFhfJO7CXOQc/.L5M2DiMc99t6FqZfe5AOWh6', 10, NULL, '99999999', 'JR CUSCO', NULL, NULL, NULL, 'usuario', '2026-03-16 20:39:08', '2026-03-16 20:39:08');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ocupacion`
--
ALTER TABLE `ocupacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pago_postulacion` (`postulacion_id`);

--
-- Indices de la tabla `postulacion`
--
ALTER TABLE `postulacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `trabajo_id` (`trabajo_id`);

--
-- Indices de la tabla `resena`
--
ALTER TABLE `resena`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resena_postulacion` (`postulacion_id`),
  ADD KEY `fk_resena_cliente` (`cliente_id`),
  ADD KEY `fk_resena_especialista` (`especialista_id`);

--
-- Indices de la tabla `trabajo`
--
ALTER TABLE `trabajo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ocupacion_id` (`ocupacion_id`),
  ADD KEY `fk_trabajo_usuario` (`usuario_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `ocupacion_id` (`ocupacion_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ocupacion`
--
ALTER TABLE `ocupacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `postulacion`
--
ALTER TABLE `postulacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `resena`
--
ALTER TABLE `resena`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `trabajo`
--
ALTER TABLE `trabajo`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `fk_pago_postulacion` FOREIGN KEY (`postulacion_id`) REFERENCES `postulacion` (`id`);

--
-- Filtros para la tabla `postulacion`
--
ALTER TABLE `postulacion`
  ADD CONSTRAINT `postulacion_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `postulacion_ibfk_2` FOREIGN KEY (`trabajo_id`) REFERENCES `trabajo` (`id`);

--
-- Filtros para la tabla `resena`
--
ALTER TABLE `resena`
  ADD CONSTRAINT `fk_resena_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_resena_especialista` FOREIGN KEY (`especialista_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_resena_postulacion` FOREIGN KEY (`postulacion_id`) REFERENCES `postulacion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `trabajo`
--
ALTER TABLE `trabajo`
  ADD CONSTRAINT `fk_trabajo_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `trabajo_ibfk_2` FOREIGN KEY (`ocupacion_id`) REFERENCES `ocupacion` (`id`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`ocupacion_id`) REFERENCES `ocupacion` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
