-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-10-2025 a las 21:13:26
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ferreteria_pro_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `almacenes`
--

CREATE TABLE `almacenes` (
  `id_almacen` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `almacenes`
--

INSERT INTO `almacenes` (`id_almacen`, `id_sucursal`, `nombre`) VALUES
(1, 1, 'Almacén Central');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carritos`
--

CREATE TABLE `carritos` (
  `id_carrito` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `ultima_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `carritos`
--

INSERT INTO `carritos` (`id_carrito`, `id_usuario`, `ultima_actualizacion`) VALUES
(3, 1, '2025-10-16 07:21:00'),
(38, 13, '2025-10-18 00:07:41'),
(39, 14, '2025-10-18 00:19:04'),
(40, 15, '2025-10-18 01:57:48'),
(41, 10001, '2025-10-20 02:23:58'),
(42, 10000, '2025-10-20 02:40:11'),
(43, 10004, '2025-10-20 05:16:29'),
(44, 10005, '2025-10-20 05:26:01'),
(45, 10007, '2025-10-20 09:51:32'),
(46, 10008, '2025-10-20 20:52:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`) VALUES
(1, 'Herramientas', 'Herramientas manuales y eléctricas'),
(2, 'Construcción', 'Materiales de construcción'),
(3, 'Pinturas', 'Pinturas y accesorios'),
(6, 'Electricidad', 'Materiales y herramientas eléctricas'),
(7, 'Fontanería', 'Accesorios y materiales de plomería'),
(8, 'Jardinería', 'Herramientas y equipos de jardín');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_carritos`
--

CREATE TABLE `detalle_carritos` (
  `id_detalle_carrito` int(11) NOT NULL,
  `id_carrito` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_carritos`
--

INSERT INTO `detalle_carritos` (`id_detalle_carrito`, `id_carrito`, `id_producto`, `cantidad`) VALUES
(40, 40, 20, 4),
(46, 40, 32, 5),
(50, 40, 50, 1),
(59, 40, 21, 3),
(63, 40, 33, 2),
(66, 42, 12, 1),
(67, 40, 12, 1),
(69, 40, 19, 1),
(72, 40, 31, 1),
(73, 40, 22, 1),
(74, 40, 4, 1),
(75, 39, 33, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ordenes_compra`
--

CREATE TABLE `detalle_ordenes_compra` (
  `id_detalle` int(11) NOT NULL,
  `id_orden` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad_solicitada` int(11) NOT NULL,
  `precio_compra_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_ordenes_compra`
--

INSERT INTO `detalle_ordenes_compra` (`id_detalle`, `id_orden`, `id_producto`, `cantidad_solicitada`, `precio_compra_unitario`) VALUES
(1, 1, 33, 1000, 0.22),
(2, 2, 31, 100, 5.00),
(4, 4, 31, 100, 10.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ventas`
--

CREATE TABLE `detalle_ventas` (
  `id_detalle_venta` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalle_ventas`
--

INSERT INTO `detalle_ventas` (`id_detalle_venta`, `id_venta`, `id_producto`, `cantidad`, `precio_unitario`) VALUES
(10, 10, 50, 5, 0.45),
(11, 11, 50, 10, 0.45),
(12, 12, 34, 10, 10.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventarios`
--

CREATE TABLE `inventarios` (
  `id_inventario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_almacen` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) DEFAULT 10,
  `ultima_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inventarios`
--

INSERT INTO `inventarios` (`id_inventario`, `id_producto`, `id_almacen`, `stock`, `stock_minimo`, `ultima_actualizacion`) VALUES
(10, 13, 1, 100, 10, '2025-10-20 07:25:07'),
(11, 14, 1, 100, 10, '2025-10-20 07:25:14'),
(12, 34, 1, 1990, 10, '2025-10-20 20:59:10'),
(15, 35, 1, 500, 10, '2025-10-20 07:41:19'),
(16, 3, 1, 102, 10, '2025-10-20 07:33:51'),
(18, 12, 1, 1000, 10, '2025-10-20 07:35:14'),
(19, 4, 1, 42, 10, '2025-10-20 07:37:49'),
(20, 15, 1, 51, 10, '2025-10-20 07:37:59'),
(22, 18, 1, 40, 10, '2025-10-20 07:41:34'),
(23, 36, 1, 100, 10, '2025-10-20 07:41:39'),
(24, 33, 1, 11000, 10, '2025-10-20 20:57:48'),
(25, 16, 1, 80, 10, '2025-10-20 07:41:55'),
(26, 19, 1, 50, 10, '2025-10-20 07:42:04'),
(27, 2, 1, 200, 10, '2025-10-20 07:42:09'),
(28, 31, 1, 300, 10, '2025-10-20 21:00:33'),
(29, 32, 1, 40, 10, '2025-10-20 07:42:27'),
(30, 20, 1, 50, 10, '2025-10-20 07:42:39'),
(31, 22, 1, 30, 10, '2025-10-20 07:42:50'),
(32, 21, 1, 60, 10, '2025-10-20 07:42:57'),
(33, 17, 1, 50, 10, '2025-10-20 07:43:04'),
(36, 52, 1, 0, 10, '2025-10-20 09:29:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcas`
--

CREATE TABLE `marcas` (
  `id_marca` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `marcas`
--

INSERT INTO `marcas` (`id_marca`, `nombre`) VALUES
(6, 'Black+Decker'),
(3, 'Bosch'),
(5, 'DeWalt'),
(7, 'Hilti'),
(8, 'Klein Tools'),
(4, 'Makita'),
(2, 'Stanley'),
(1, 'Truper');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_compra`
--

CREATE TABLE `ordenes_compra` (
  `id_orden` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_usuario_creador` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_recepcion` datetime DEFAULT NULL,
  `estado` enum('Pendiente','Enviada','Recibida','Cancelada') NOT NULL DEFAULT 'Pendiente',
  `total_estimado` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ordenes_compra`
--

INSERT INTO `ordenes_compra` (`id_orden`, `id_proveedor`, `id_usuario_creador`, `fecha_creacion`, `fecha_recepcion`, `estado`, `total_estimado`) VALUES
(1, 1, 1, '2025-10-19 22:54:03', '2025-10-20 14:57:48', 'Recibida', 220.00),
(2, 2, 1, '2025-10-20 00:04:01', '2025-10-20 15:00:17', 'Recibida', 500.00),
(4, 2, 1, '2025-10-20 14:55:45', '2025-10-20 15:00:33', 'Recibida', 1000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `codigo_barras` varchar(100) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `precio_oferta` decimal(10,2) DEFAULT NULL,
  `precio_compra` decimal(10,2) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_marca` int(11) NOT NULL,
  `id_unidad` int(11) NOT NULL,
  `imagen` varchar(255) DEFAULT 'https://via.placeholder.com/250',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `es_oferta` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `codigo_barras`, `nombre`, `descripcion`, `precio_venta`, `precio_oferta`, `precio_compra`, `id_categoria`, `id_marca`, `id_unidad`, `imagen`, `activo`, `es_oferta`) VALUES
(2, '', 'Martillo', 'Martillo de acero con mango de madera', 5.50, NULL, 3.85, 1, 1, 1, 'https://promart.vteximg.com.br/arquivos/ids/9115533-700-700/91113.jpg?v=638882939765870000', 1, 0),
(3, NULL, 'Taladro', 'Taladro eléctrico 500W', 45.00, NULL, 31.50, 1, 3, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmamZDXUEYM1njnDEuv7DaZNO5EFf8lKQwZg&s', 1, 0),
(4, NULL, 'Pintura blanca', 'Pintura de interior 1L', 12.75, NULL, 8.93, 3, 2, 3, 'https://walmartsv.vtexassets.com/arquivos/ids/265916/Pintura-Latex-Century-Color-Blanco-Galon-1-683.jpg?v=637989502578770000', 1, 0),
(12, NULL, 'Ceramica Estilo Madera', 'Resistente ceramica estilo madera clara', 12.99, NULL, 9.09, 2, 1, 2, 'https://pisosdemadera.mx/wp-content/uploads/2020/03/pisos-cer%C3%A1micos-tipo-madera.jpg', 1, 0),
(13, NULL, 'Alicate Universal 8\"', 'Alicate de acero cromado con mangos aislados', 7.50, NULL, 5.25, 6, 2, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpr5rRKaIeSf1NGDV-W_lTh-jkXUYfiYvNtA&s', 1, 0),
(14, NULL, 'Cable eléctrico 3x2.5mm 10m', 'Cable de cobre flexible recubierto PVC', 12.00, NULL, 8.40, 6, 1, 2, 'https://http2.mlstatic.com/D_NQ_NP_997936-MLC31213908855_062019-O.jpg', 1, 0),
(15, NULL, 'Taladro Percutor 750W', 'Taladro percutor de velocidad variable', 89.90, NULL, 62.93, 6, 5, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxd7tsYhJ_3RcW8awBtbXMSwlojO8UlOpcjA&s', 1, 0),
(16, NULL, 'Llave Inglesa 12\"', 'Llave ajustable de acero forjado', 15.00, NULL, 10.50, 7, 5, 1, 'https://www.toolferreterias.com/cdn/shop/products/179020250-1_e46d5c80-fd5b-4d89-ab50-378b0a5bc5b7.jpg?v=1707255861', 1, 0),
(17, NULL, 'Tubo PVC 1/2\" x 3m', 'Tubo de PVC para agua potable', 3.25, NULL, 2.28, 7, 1, 1, 'https://easycolombia.vtexassets.com/arquivos/ids/236125/7707015309106-1.jpg?v=638598811613400000', 1, 0),
(18, NULL, 'Grifo Monomando Cocina', 'Grifo de acero inoxidable acabado cromado', 32.50, NULL, 22.75, 7, 8, 1, 'https://www.tresgriferia.com/cdnassets/products/l/21644010.jpg', 1, 0),
(19, NULL, 'Manguera de Jardín 20m', 'Manguera flexible reforzada con conexiones metálicas', 22.99, NULL, 16.09, 8, 6, 2, 'https://aliss.do/media/catalog/product/1/2/12d6c481c68347ce173797418712090e2e2ce18d_file.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700', 1, 0),
(20, NULL, 'Podadora Eléctrica 1600W', 'Podadora con bolsa recolectora 35L', 145.00, NULL, 101.50, 8, 4, 1, 'https://daewooherramientas.com.ar/wp-content/uploads/2022/09/dac1600-consombra.jpg', 1, 0),
(21, NULL, 'Tijera de Podar 8\"', 'Tijera de acero al carbono con mango ergonómico', 9.75, NULL, 6.83, 8, 1, 1, 'https://www.elferretero.com.mx/imageOriginal/T-67.jpg', 1, 0),
(22, NULL, 'Sopladora de Hojas', 'Sopladora eléctrica ligera y potente', 119.90, NULL, 83.93, 8, 6, 1, 'https://carbonestore.cr/cdn/shop/files/YT-85176_800x.jpg?v=1724520272', 1, 0),
(31, NULL, 'Pintura Roja', 'Pintura roja brillante', 12.00, 4.20, 8.40, 3, 5, 3, 'https://s3.pagegear.co/321/articulos/13426/55963_700x933.jpg?8249127', 1, 1),
(32, NULL, 'Pintura Verde', 'Pintura verde ', 12.00, NULL, 8.40, 3, 5, 3, 'https://sv.epaenlinea.com/media/catalog/product/cache/0c8c7ea187ea7a0c7220c70b613a31ab/2/9/295ad51e-5fdd-49d1-95fa-808df9dcbac5.jpg', 1, 0),
(33, '8484', 'Ladrillo Rojo', 'Ladrillo rojo de construccion.', 0.45, 0.25, 0.32, 2, 1, 1, 'https://materialeslibertad.com/cdn/shop/files/LADRILLOROJOPERSPECTIVA_1024x1024.png?v=1688400001', 1, 1),
(34, NULL, 'Cemento Fuerte', 'Cemento 42.5kg  ', 10.00, NULL, 7.00, 2, 3, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROUhty3KHoT6Vrm_nxxWem3xSHq0FXxJh-FQ&s', 1, 0),
(35, NULL, 'Ceramica Estilo Piedra', 'Piso cerámico Porto multicolor', 12.00, NULL, 8.40, 2, 3, 1, 'https://www.construmole.com/wp-content/uploads/2023/02/PISO-SIBONEY-MULTICOLOR-55.2-X-55.2-CAJA-X-1.52Mts.jpg', 1, 0),
(36, '1254', 'Juego de 120 Herramientas ', 'Juego de 120 herramientas mecánicas', 125.00, NULL, 87.50, 1, 6, 1, 'https://gt.epaenlinea.com/media/catalog/product/cache/3f8a07f91ed96197ac7613a4e8859f2d/a/8/a83114de-d1db-4b0d-ad39-8b983b9e1b37.jpg', 1, 0),
(50, '2122121', 'Ladrillo Azul', 'Azul', 0.45, NULL, 0.10, 2, 7, 1, 'https://promart.vteximg.com.br/arquivos/ids/9115533-700-700/91113.jpg?v=638882939765870000', 0, 0),
(52, '98989', 'Serrucho para Carpintero', '22 pulgadas o 55.88 cm', 7.95, 6.50, 5.00, 1, 6, 1, 'https://ferreteriavidri.com/images/items/large/421584.jpg', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id_proveedor`, `id_usuario`, `nombre`, `telefono`, `correo`, `direccion`) VALUES
(1, 10004, 'Proveedor Principal S.A.', NULL, NULL, 'Dirección del proveedor'),
(2, 10005, 'Carlos Alberto', '2278-5500', 'carlos.ayala@cuscatlan.sv', 'Km 5 Carretera a Puerto de La Libertad, Antiguo Cuscatlán, La Libertad. (Una dirección comercial común en el área metropolitana de San Salvador)');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre`) VALUES
(1, 'Administrador'),
(3, 'Bodeguero'),
(5, 'Cliente'),
(4, 'Proveedor'),
(2, 'Vendedor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursales`
--

CREATE TABLE `sucursales` (
  `id_sucursal` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sucursales`
--

INSERT INTO `sucursales` (`id_sucursal`, `nombre`, `direccion`) VALUES
(1, 'Principal', 'Dirección Principal');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades_medida`
--

CREATE TABLE `unidades_medida` (
  `id_unidad` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `abreviatura` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `unidades_medida`
--

INSERT INTO `unidades_medida` (`id_unidad`, `nombre`, `abreviatura`) VALUES
(1, 'Pieza', 'pz'),
(2, 'Caja', 'cj'),
(3, 'Litro', 'L');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `apellido` varchar(150) DEFAULT NULL,
  `carnet_identidad` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `direccion` text DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT 'https://via.placeholder.com/150',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `id_rol`, `nombre`, `apellido`, `carnet_identidad`, `telefono`, `correo`, `password`, `direccion`, `foto_perfil`, `activo`, `created_at`) VALUES
(1, 1, 'Admin', 'Principal', '', '', 'admin@ferreteria.com', '$2b$10$uEj7D8c0o8H.APH0CvRA8uyQ.HXVUZgNl.7fa2jrybja39LcCckTe', '', 'https://via.placeholder.com/150', 1, '2025-10-16 06:05:09'),
(13, 3, 'Manuel', 'Raimon', 'mz123', '5418354', 'Manuel@gmail.com', '$2b$10$4zc1zV2QuicV3zlM0HrxR.Jd/Mol.cUvf0ikWxz05Lhqa8FYYWAXe', 'Estadio xD', 'https://via.placeholder.com/150', 1, '2025-10-18 00:07:28'),
(14, 5, 'Emilio', NULL, NULL, NULL, 'Emilio@gmail.com', '$2b$10$N3M0ePW2.MXs3LuJyGriZeqVVjrMNoqj7ViOHRzQ6mWamIydpy3Om', NULL, 'https://via.placeholder.com/150', 1, '2025-10-18 00:19:04'),
(15, 5, 'Sebastian', NULL, NULL, NULL, 'Sebastian@gmail.com', '$2b$10$fLSChIAay8Yxh7UAuOJZNuXHuRB1v4jf2bc01DZb8zR8p9whIWiZa', NULL, 'https://via.placeholder.com/150', 1, '2025-10-18 01:57:47'),
(9999, 5, 'Cliente Mostrador', NULL, NULL, NULL, 'generico@ferreteria.com', 'N/A', NULL, 'https://via.placeholder.com/150', 1, '2025-10-18 03:32:55'),
(10000, 2, 'Ricardo', 'come monda', '515155', '5418354', 'Ricardo@gmail.com', '$2b$10$4bGrhyAVNxw1T2mtpkH87eGSV8d/ToLu0RH0Zx82zVopgVdEK9c2.', 'no se', 'https://via.placeholder.com/150', 1, '2025-10-18 04:20:43'),
(10001, 4, 'Manuela', 'come monda', 'Sebas', '5418354', 'admin@gmail.com', '$2b$10$4ADUlRFeVjnHa7n7w/tgQOayWu0iBZMNb1KAY.J41suwb4Q7lvIsG', 'lol', 'https://via.placeholder.com/150', 0, '2025-10-18 04:47:54'),
(10004, 4, 'Proveedor Principal', 'Principal', '004568', '78458625', 'proveedor@email.com', '$2b$10$kYn2rFIDWzbbUk/8ZgocIunZ3amw36IBvk8pVJ8oEKse.8KrjILkO', 'Calle Falsa 123, Comuna de Las Condes, Santiago', 'https://via.placeholder.com/150', 1, '2025-10-20 05:10:13'),
(10005, 4, 'Carlos Alberto', 'Ayala Durán', '02081985-5', '2278-5500', 'carlos.ayala@cuscatlan.sv', '$2b$10$2V8PM6DO/bcMDp88y8bvcO2d/tKk05xvJmeKTZQyNFKkbjLXmaquO', 'Km 5 Carretera a Puerto de La Libertad, Antiguo Cuscatlán, La Libertad. (Una dirección comercial común en el área metropolitana de San Salvador)', 'https://via.placeholder.com/150', 1, '2025-10-20 05:25:46'),
(10007, 5, 'Sebastian', NULL, NULL, NULL, 'Sebastian1@gmail.com', '$2b$10$Dfcq94dcOzoBw7eUlB.Np.6PRR2m.vMRiF4YsctAcS5UTG8w9JMMe', NULL, 'https://via.placeholder.com/150', 1, '2025-10-20 09:51:32'),
(10008, 5, 'Jenni', NULL, NULL, NULL, 'jenniLopez@gmail.com', '$2b$10$o/uKfPFBXhU7r6GrW/Z1keTsL1tKRpbG/13cHxUt2biNT449SLCjW', NULL, 'https://via.placeholder.com/150', 1, '2025-10-20 20:52:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL,
  `id_cliente_usuario` int(11) NOT NULL,
  `id_vendedor_usuario` int(11) NOT NULL,
  `id_sucursal` int(11) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` enum('Efectivo','Tarjeta','Transferencia') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id_venta`, `id_cliente_usuario`, `id_vendedor_usuario`, `id_sucursal`, `fecha`, `total`, `metodo_pago`) VALUES
(10, 9999, 10000, 1, '2025-10-20 00:49:41', 2.59, 'Efectivo'),
(11, 15, 10000, 1, '2025-10-20 02:25:40', 5.17, 'Efectivo'),
(12, 15, 10000, 1, '2025-10-20 14:59:10', 115.00, 'Tarjeta');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `almacenes`
--
ALTER TABLE `almacenes`
  ADD PRIMARY KEY (`id_almacen`),
  ADD KEY `fk_almacenes_sucursal` (`id_sucursal`);

--
-- Indices de la tabla `carritos`
--
ALTER TABLE `carritos`
  ADD PRIMARY KEY (`id_carrito`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `detalle_carritos`
--
ALTER TABLE `detalle_carritos`
  ADD PRIMARY KEY (`id_detalle_carrito`),
  ADD UNIQUE KEY `carrito_producto` (`id_carrito`,`id_producto`),
  ADD KEY `fk_detalle_carritos_producto` (`id_producto`);

--
-- Indices de la tabla `detalle_ordenes_compra`
--
ALTER TABLE `detalle_ordenes_compra`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `fk_detalle_orden` (`id_orden`),
  ADD KEY `fk_detalle_producto` (`id_producto`);

--
-- Indices de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id_detalle_venta`),
  ADD KEY `fk_detalle_ventas_venta` (`id_venta`),
  ADD KEY `fk_detalle_ventas_producto` (`id_producto`);

--
-- Indices de la tabla `inventarios`
--
ALTER TABLE `inventarios`
  ADD PRIMARY KEY (`id_inventario`),
  ADD UNIQUE KEY `producto_almacen` (`id_producto`,`id_almacen`),
  ADD KEY `fk_inventarios_almacen` (`id_almacen`);

--
-- Indices de la tabla `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`id_marca`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD PRIMARY KEY (`id_orden`),
  ADD KEY `fk_ordenes_proveedor` (`id_proveedor`),
  ADD KEY `fk_ordenes_usuario` (`id_usuario_creador`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD UNIQUE KEY `codigo_barras` (`codigo_barras`),
  ADD KEY `fk_productos_categorias` (`id_categoria`),
  ADD KEY `fk_productos_marcas` (`id_marca`),
  ADD KEY `fk_productos_unidades` (`id_unidad`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `sucursales`
--
ALTER TABLE `sucursales`
  ADD PRIMARY KEY (`id_sucursal`);

--
-- Indices de la tabla `unidades_medida`
--
ALTER TABLE `unidades_medida`
  ADD PRIMARY KEY (`id_unidad`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `fk_usuarios_roles` (`id_rol`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `fk_ventas_cliente` (`id_cliente_usuario`),
  ADD KEY `fk_ventas_vendedor` (`id_vendedor_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `almacenes`
--
ALTER TABLE `almacenes`
  MODIFY `id_almacen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `carritos`
--
ALTER TABLE `carritos`
  MODIFY `id_carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `detalle_carritos`
--
ALTER TABLE `detalle_carritos`
  MODIFY `id_detalle_carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT de la tabla `detalle_ordenes_compra`
--
ALTER TABLE `detalle_ordenes_compra`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  MODIFY `id_detalle_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `inventarios`
--
ALTER TABLE `inventarios`
  MODIFY `id_inventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id_marca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  MODIFY `id_orden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `sucursales`
--
ALTER TABLE `sucursales`
  MODIFY `id_sucursal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `unidades_medida`
--
ALTER TABLE `unidades_medida`
  MODIFY `id_unidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10009;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `almacenes`
--
ALTER TABLE `almacenes`
  ADD CONSTRAINT `fk_almacenes_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id_sucursal`);

--
-- Filtros para la tabla `carritos`
--
ALTER TABLE `carritos`
  ADD CONSTRAINT `fk_carritos_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `detalle_carritos`
--
ALTER TABLE `detalle_carritos`
  ADD CONSTRAINT `fk_detalle_carritos_carrito` FOREIGN KEY (`id_carrito`) REFERENCES `carritos` (`id_carrito`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_detalle_carritos_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `detalle_ordenes_compra`
--
ALTER TABLE `detalle_ordenes_compra`
  ADD CONSTRAINT `fk_detalle_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_compra` (`id_orden`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `fk_detalle_ventas_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `fk_detalle_ventas_venta` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventarios`
--
ALTER TABLE `inventarios`
  ADD CONSTRAINT `fk_inventarios_almacen` FOREIGN KEY (`id_almacen`) REFERENCES `almacenes` (`id_almacen`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_inventarios_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ordenes_compra`
--
ALTER TABLE `ordenes_compra`
  ADD CONSTRAINT `fk_ordenes_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`),
  ADD CONSTRAINT `fk_ordenes_usuario` FOREIGN KEY (`id_usuario_creador`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  ADD CONSTRAINT `fk_productos_marcas` FOREIGN KEY (`id_marca`) REFERENCES `marcas` (`id_marca`),
  ADD CONSTRAINT `fk_productos_unidades` FOREIGN KEY (`id_unidad`) REFERENCES `unidades_medida` (`id_unidad`);

--
-- Filtros para la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD CONSTRAINT `fk_proveedor_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_ventas_cliente` FOREIGN KEY (`id_cliente_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `fk_ventas_vendedor` FOREIGN KEY (`id_vendedor_usuario`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
