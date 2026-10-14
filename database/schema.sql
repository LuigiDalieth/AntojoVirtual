-- ==============================================================
-- Base de Datos: antojovirtual_db
-- Proyecto: Antojo Virtual — Gastronomía Local de Neiva (PHP + MySQL + XAMPP)
-- Patrones aplicados: DAO, Repository, Singleton (Database), MVC
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `antojovirtual_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `antojovirtual_db`;

-- Desactivar llaves foráneas temporalmente para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `order_item_toppings`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `couriers`;
DROP TABLE IF EXISTS `toppings`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `businesses`;
DROP TABLE IF EXISTS `neighborhoods`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Tabla de Usuarios
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `role` ENUM('cliente', 'negocio', 'domiciliario', 'admin') DEFAULT 'cliente',
  `neighborhood_id` VARCHAR(50) NULL,
  `address_details` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla de Barrios de Neiva
CREATE TABLE `neighborhoods` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `commune` VARCHAR(100) NOT NULL,
  `lat` DECIMAL(10, 6) NOT NULL,
  `lng` DECIMAL(10, 6) NOT NULL
) ENGINE=InnoDB;

-- 3. Tabla de Negocios / Restaurantes
CREATE TABLE `businesses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `specialty` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `neighborhood_id` VARCHAR(50) NOT NULL,
  `address` VARCHAR(200) NOT NULL,
  `lat` DECIMAL(10, 6) NOT NULL,
  `lng` DECIMAL(10, 6) NOT NULL,
  `is_open` TINYINT(1) DEFAULT 1,
  `schedule` VARCHAR(100) DEFAULT '5:00 PM - 11:30 PM',
  `rating` DECIMAL(2,1) DEFAULT 4.8,
  `review_count` INT DEFAULT 120,
  `cover_image_url` VARCHAR(500) NULL,
  `min_order_cop` INT DEFAULT 18000,
  CONSTRAINT `fk_business_neighborhood` FOREIGN KEY (`neighborhood_id`) REFERENCES `neighborhoods`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla de Productos
CREATE TABLE `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `business_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `description` TEXT NULL,
  `category` ENUM('Hamburguesas', 'Salchipapas', 'Arepas', 'Alitas', 'Perros') NOT NULL,
  `base_price` INT NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `prep_time_minutes` INT DEFAULT 25,
  `stock` INT DEFAULT 50,
  `is_featured` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_product_business` FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabla de Toppings / Adicionales
CREATE TABLE `toppings` (
  `id` VARCHAR(50) PRIMARY KEY,
  `product_id` VARCHAR(50) NULL,
  `name` VARCHAR(100) NOT NULL,
  `category` ENUM('quesos', 'proteinas', 'salsas', 'adicionales') NOT NULL,
  `price` INT NOT NULL DEFAULT 0,
  `max_portions` INT DEFAULT 3,
  `is_available` TINYINT(1) DEFAULT 1,
  CONSTRAINT `fk_topping_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabla de Domiciliarios
CREATE TABLE `couriers` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `vehicle` VARCHAR(50) NOT NULL,
  `plate` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `neighborhood_id` VARCHAR(50) NOT NULL,
  `lat` DECIMAL(10, 6) NOT NULL,
  `lng` DECIMAL(10, 6) NOT NULL,
  `rating` DECIMAL(2,1) DEFAULT 4.9,
  `is_available` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 7. Tabla de Pedidos (Orders)
CREATE TABLE `orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` INT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `neighborhood_id` VARCHAR(50) NOT NULL,
  `delivery_address` VARCHAR(255) NOT NULL,
  `subtotal_cop` INT NOT NULL,
  `service_fee_cop` INT NOT NULL DEFAULT 1500,
  `delivery_fee_cop` INT NOT NULL,
  `discount_cop` INT DEFAULT 0,
  `total_cop` INT NOT NULL,
  `distance_km` DECIMAL(5,2) NOT NULL DEFAULT 2.50,
  `payment_method` ENUM('Efectivo', 'Nequi', 'DaviPlata', 'Tarjeta', 'Transferencia Nequi / Daviplata') NOT NULL DEFAULT 'Efectivo',
  `payment_status` ENUM('Pendiente', 'Aprobado', 'Rechazado') DEFAULT 'Pendiente',
  `transaction_id` VARCHAR(100) NULL,
  `cash_change_for` INT NULL,
  `status` ENUM('Recibido', 'Preparando', 'En camino', 'Entregado') DEFAULT 'Recibido',
  `courier_id` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_order_neighborhood` FOREIGN KEY (`neighborhood_id`) REFERENCES `neighborhoods`(`id`),
  CONSTRAINT `fk_order_courier` FOREIGN KEY (`courier_id`) REFERENCES `couriers`(`id`)
) ENGINE=InnoDB;

-- 8. Tabla de Ítems del Pedido
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(120) NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` INT NOT NULL,
  `line_total` INT NOT NULL,
  `notes` VARCHAR(255) NULL,
  CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Tabla de Toppings seleccionados por ítem de pedido
CREATE TABLE `order_item_toppings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_item_id` INT NOT NULL,
  `topping_id` VARCHAR(50) NOT NULL,
  `topping_name` VARCHAR(100) NOT NULL,
  `topping_price` INT NOT NULL,
  `quantity` INT NOT NULL,
  CONSTRAINT `fk_topping_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================================================
-- DATOS INICIALES (SEED DATA)
-- ==============================================================

-- Barrios de Neiva
INSERT INTO `neighborhoods` (`id`, `name`, `commune`, `lat`, `lng`) VALUES
('altico', 'El Altico', 'Comuna 3 · Centro', 2.927300, -75.281900),
('quirinal', 'El Quirinal', 'Comuna 2 · Norte', 2.938500, -75.286200),
('ico', 'Ipanema / Santa Inés', 'Comuna 1 · Noroccidente', 2.951200, -75.294000),
('canaima', 'Canaima / Sur', 'Comuna 6 · Sur', 2.905500, -75.276500),
('la-rioja', 'La Rioja / Oriente', 'Comuna 5 · Oriente', 2.931000, -75.264000);

-- Negocios en Neiva
INSERT INTO `businesses` (`id`, `name`, `specialty`, `description`, `neighborhood_id`, `address`, `lat`, `lng`, `is_open`, `schedule`, `rating`, `review_count`, `cover_image_url`, `min_order_cop`) VALUES
('b-01', 'Burger Huila Master', 'Hamburguesas artesanales al carbón', 'Carne 100% Angus con reducción de achiras del Huila y toques autóctonos.', 'quirinal', 'Cra 6 # 14-25, El Quirinal', 2.939000, -75.285500, 1, '5:00 PM - 11:30 PM', 4.9, 154, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', 20000),
('b-02', 'Salchipapería La Gaitana', 'Salchipapas monumentales y carnes mixtas', 'Costilla BBQ, bondiola crocante, papas criollas doradas y queso costeño gratinado.', 'altico', 'Calle 7 # 12-40, El Altico', 2.928000, -75.281000, 1, '4:00 PM - 12:00 AM', 4.8, 203, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80', 18000),
('b-03', 'Arepas & Carbón Opita', 'Arepas de chócolo y masa de maíz rellenas', 'Queso campesino doble crema, pollo desmechado en hogao y asado huilense.', 'ico', 'Av 26 # 34-12, Ipanema', 2.950500, -75.293000, 1, '5:30 PM - 11:00 PM', 4.7, 98, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80', 15000),
('b-04', 'Alitas Magdalena Crunch', 'Alitas apanadas y ahumadas en salsas de maracuyá y gulupa', 'Crujientes al punto exacto con salsas artesanales de frutas de la región.', 'la-rioja', 'Cra 22 # 8-50, La Rioja', 2.932000, -75.263500, 1, '6:00 PM - 11:30 PM', 4.8, 142, 'https://images.unsplash.com/photo-1527477321075-d3a7485c6e75?w=800&q=80', 22000);

-- Domiciliarios
INSERT INTO `couriers` (`id`, `name`, `vehicle`, `plate`, `phone`, `neighborhood_id`, `lat`, `lng`, `rating`, `is_available`) VALUES
('c-01', 'Carlos Mario Perdomo', 'Yamaha NMAX', 'XYZ-45E', '312 458 9012', 'quirinal', 2.937000, -75.285000, 4.9, 1),
('c-02', 'Andrea Valentina Tovar', 'Bajaj Pulsar NS200', 'HUQ-12F', '315 902 3341', 'altico', 2.926500, -75.280500, 4.8, 1),
('c-03', 'Felipe Dussán Charry', 'Suzuki Gixxer', 'NEI-89D', '320 774 1190', 'ico', 2.949000, -75.291000, 5.0, 1);

-- Usuarios de prueba (contraseña por defecto encriptada: 'admin123' o '123456')
-- password_hash('123456', PASSWORD_BCRYPT) -> $2y$10$wTsu6UcmK.cO2J1/oW/k6eX2z57jJ5u/nK85t310iC.lB0N88W7tG
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `neighborhood_id`, `address_details`) VALUES
(1, 'Admin Antojo', 'admin@antojovirtual.com', '$2y$10$e7KqV0wYIqF4y6X1n/Jt9eqT5rV.G77c4MvJ2Ew1uX.rY1/iM69.y', '3101234567', 'admin', 'quirinal', 'Centro Operativo Neiva'),
(2, 'Juan David Pastrana', 'cliente@antojovirtual.com', '$2y$10$e7KqV0wYIqF4y6X1n/Jt9eqT5rV.G77c4MvJ2Ew1uX.rY1/iM69.y', '3187654321', 'cliente', 'altico', 'Calle 8 # 11-20 Apto 302');

-- Productos
INSERT INTO `products` (`id`, `business_id`, `name`, `description`, `category`, `base_price`, `image_url`, `prep_time_minutes`, `stock`, `is_featured`) VALUES
('p-01', 'b-01', 'Hamburguesa Tatacoa BBQ', '200g carne Angus, cebolla caramelizada, tocineta ahumada y salsa BBQ con toques de panela.', 'Hamburguesas', 26000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', 25, 45, 1),
('p-02', 'b-01', 'Hamburguesa Achirada Especial', '180g carne de res, crocante de achiras huilenses trituradas y queso campesino fundido.', 'Hamburguesas', 28500, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80', 28, 30, 1),
('p-03', 'b-02', 'Salchipapa Monumental Opita', 'Papas rústicas doradas, salchicha americana premium, tocineta, queso costeño rallado y tártara casera.', 'Salchipapas', 32000, 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80', 20, 50, 1),
('p-04', 'b-02', 'Desgranado Mixto Callejero', 'Maíz dulce tierno salteado con pollo, tocineta, papa fosforito, salsa tártara y piña de la casa.', 'Salchipapas', 24000, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&q=80', 18, 40, 0),
('p-05', 'b-03', 'Arepa de Chócolo con Asado Huilense', 'Arepa de maíz dulce artesanal rellena de auténtico asado huilense desmechado y queso campesino derretido.', 'Arepas', 19500, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80', 15, 60, 1),
('p-06', 'b-03', 'Arepa Rellena Trifásica', 'Carne desmechada, pechuga de pollo, chicharrón crocante y guacamole suave en masa de maíz blanco.', 'Arepas', 21000, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80', 20, 35, 0),
('p-07', 'b-04', 'Alitas Glaseadas Maracuyá & Ají Dulce (10 pcs)', '10 piezas crocantes glaseadas en reducción de maracuyá huilense con apio y salsa ranchera artesanal.', 'Alitas', 29000, 'https://images.unsplash.com/photo-1527477321075-d3a7485c6e75?w=800&q=80', 25, 40, 1),
('p-08', 'b-01', 'Perro Caliente Especial San Juanero', 'Salchicha suiza gigante, tocineta crujiente, queso gratinado, huevo de codorniz y salsa de piña.', 'Perros', 18500, 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=800&q=80', 15, 40, 0);

-- Toppings
INSERT INTO `toppings` (`id`, `product_id`, `name`, `category`, `price`, `max_portions`, `is_available`) VALUES
('top-01', NULL, 'Doble Queso Costeño Rallado', 'quesos', 3500, 3, 1),
('top-02', NULL, 'Tocineta Ahumada Extra (3 tiras)', 'proteinas', 4500, 3, 1),
('top-03', NULL, 'Guacamole Casero', 'adicionales', 3000, 2, 1),
('top-04', NULL, 'Salsa Tártara Artesanal Neivana', 'salsas', 2000, 3, 1),
('top-05', NULL, 'Crocante de Chicharrón', 'proteinas', 5000, 2, 1),
('top-06', NULL, 'Salsa BBQ Panela Huilense', 'salsas', 2000, 2, 1);
