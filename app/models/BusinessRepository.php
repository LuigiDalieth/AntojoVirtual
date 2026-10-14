<?php
namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Patrón Repository para Negocios y Barrios de Neiva
 */
class BusinessRepository {
    private ?PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll(): array {
        if (!$this->db) return [];

        $sql = "SELECT b.*, n.name AS neighborhood_name, n.commune
                FROM businesses b
                JOIN neighborhoods n ON b.neighborhood_id = n.id
                ORDER BY b.rating DESC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function findById(string $id): ?array {
        if (!$this->db) return null;

        $stmt = $this->db->prepare("SELECT b.*, n.name AS neighborhood_name, n.commune
                                    FROM businesses b
                                    JOIN neighborhoods n ON b.neighborhood_id = n.id
                                    WHERE b.id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function getAllNeighborhoods(): array {
        if (!$this->db) return [];

        $stmt = $this->db->query("SELECT * FROM neighborhoods ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    public function getNeighborhoodById(string $id): ?array {
        if (!$this->db) return null;

        $stmt = $this->db->prepare("SELECT * FROM neighborhoods WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }
}
