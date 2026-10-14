<?php
namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Patrón Repository / DAO para la gestión de Productos y Toppings
 */
class ProductRepository {
    private ?PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll(?string $category = null, ?string $businessId = null, ?string $search = null): array {
        if (!$this->db) return [];

        $sql = "SELECT p.*, b.name AS business_name, b.specialty AS business_specialty, 
                       b.neighborhood_id, n.name AS neighborhood_name
                FROM products p
                JOIN businesses b ON p.business_id = b.id
                JOIN neighborhoods n ON b.neighborhood_id = n.id
                WHERE 1=1";
        
        $params = [];

        if ($category && $category !== 'Todas') {
            $sql .= " AND p.category = :category";
            $params[':category'] = $category;
        }

        if ($businessId) {
            $sql .= " AND p.business_id = :businessId";
            $params[':businessId'] = $businessId;
        }

        if ($search) {
            $sql .= " AND (p.name LIKE :search OR p.description LIKE :search OR b.name LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }

        $sql .= " ORDER BY p.is_featured DESC, p.name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findById(string $id): ?array {
        if (!$this->db) return null;

        $stmt = $this->db->prepare("SELECT p.*, b.name AS business_name, b.min_order_cop
                                    FROM products p
                                    JOIN businesses b ON p.business_id = b.id
                                    WHERE p.id = :id");
        $stmt->execute([':id' => $id]);
        $product = $stmt->fetch();

        if ($product) {
            $product['toppings'] = $this->getToppingsForProduct($id);
        }

        return $product ?: null;
    }

    public function getToppingsForProduct(?string $productId = null): array {
        if (!$this->db) return [];

        $stmt = $this->db->query("SELECT * FROM toppings WHERE is_available = 1 ORDER BY category, price ASC");
        return $stmt->fetchAll();
    }
}
