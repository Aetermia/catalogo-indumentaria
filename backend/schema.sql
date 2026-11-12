-- Esquema MySQL 5.7+ / MariaDB 10.4+ para el catálogo.
-- Importar con: mysql -u USUARIO -p NOMBRE_BASE < schema.sql

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario VARCHAR(60) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  imagenes JSON NULL,
  variantes JSON NULL,
  descuento_porcentaje INT NOT NULL DEFAULT 0,
  tipo_promocion VARCHAR(30) NOT NULL DEFAULT 'NONE',
  descuento_segunda_unidad INT NOT NULL DEFAULT 0,
  etiqueta VARCHAR(50) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_productos_activo_categoria (activo, categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear el primer administrador:
-- 1) Generar el hash:  php -r "echo password_hash('TU_CLAVE', PASSWORD_DEFAULT), PHP_EOL;"
-- 2) Insertarlo:
-- INSERT INTO admins (usuario, password_hash) VALUES ('admin', 'HASH_GENERADO');
