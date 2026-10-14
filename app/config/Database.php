<?php
namespace App\Config;

use PDO;
use PDOException;

/**
 * Patrón Singleton para la conexión centralizada a MySQL vía PDO
 */
class Database {
    private static ?Database $instance = null;
    private ?PDO $connection = null;

    private string $host = '127.0.0.1';
    private string $dbName = 'antojovirtual_db';
    private string $user = 'root';
    private string $pass = '';
    private string $charset = 'utf8mb4';

    private function __construct() {
        $dsn = "mysql:host={$this->host};dbname={$this->dbName};charset={$this->charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->connection = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (PDOException $e) {
            // Si la base de datos no existe aún, intentamos conectar al servidor para permitir su creación
            try {
                $dsnServer = "mysql:host={$this->host};charset={$this->charset}";
                $this->connection = new PDO($dsnServer, $this->user, $this->pass, $options);
            } catch (PDOException $ex) {
                $this->connection = null;
            }
        }
    }

    // Evitar clonación
    private function __clone() {}

    // Evitar des-serialización
    public function __wakeup() {
        throw new \Exception("Cannot unserialize singleton");
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): ?PDO {
        return $this->connection;
    }
}
