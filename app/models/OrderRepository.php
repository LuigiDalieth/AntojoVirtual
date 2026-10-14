<?php
namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Patrón Repository para Gestión de Pedidos, Asignación de Domiciliarios y Transacciones
 */
class OrderRepository {
    private ?PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll(): array {
        if (!$this->db) return [];

        $sql = "SELECT o.*, n.name AS neighborhood_name, c.name AS courier_name, c.vehicle, c.plate
                FROM orders o
                LEFT JOIN neighborhoods n ON o.neighborhood_id = n.id
                LEFT JOIN couriers c ON o.courier_id = c.id
                ORDER BY o.created_at DESC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function findById(string $id): ?array {
        if (!$this->db) return null;

        $stmt = $this->db->prepare("SELECT o.*, n.name AS neighborhood_name, c.name AS courier_name, 
                                           c.vehicle, c.plate, c.phone AS courier_phone, c.rating AS courier_rating
                                    FROM orders o
                                    LEFT JOIN neighborhoods n ON o.neighborhood_id = n.id
                                    LEFT JOIN couriers c ON o.courier_id = c.id
                                    WHERE o.id = :id");
        $stmt->execute([':id' => $id]);
        $order = $stmt->fetch();

        if ($order) {
            $itemsStmt = $this->db->prepare("SELECT * FROM order_items WHERE order_id = :order_id");
            $itemsStmt->execute([':order_id' => $id]);
            $order['items'] = $itemsStmt->fetchAll();

            foreach ($order['items'] as &$item) {
                $topStmt = $this->db->prepare("SELECT * FROM order_item_toppings WHERE order_item_id = :item_id");
                $topStmt->execute([':item_id' => $item['id']]);
                $item['toppings'] = $topStmt->fetchAll();
            }
        }

        return $order ?: null;
    }

    public function getAvailableCourier(): ?array {
        if (!$this->db) return null;

        $stmt = $this->db->query("SELECT * FROM couriers WHERE is_available = 1 ORDER BY rating DESC LIMIT 1");
        return $stmt->fetch() ?: null;
    }

    public function createOrder(array $data, array $items): ?string {
        if (!$this->db) return null;

        try {
            $this->db->beginTransaction();

            $orderId = 'ORD-' . strtoupper(substr(uniqid(), -6));
            $courier = $this->getAvailableCourier();
            $courierId = $courier ? $courier['id'] : null;

            $sql = "INSERT INTO orders (
                        id, customer_name, customer_phone, neighborhood_id, delivery_address,
                        subtotal_cop, service_fee_cop, delivery_fee_cop, discount_cop, total_cop,
                        distance_km, payment_method, cash_change_for, status, courier_id
                    ) VALUES (
                        :id, :customer_name, :customer_phone, :neighborhood_id, :delivery_address,
                        :subtotal_cop, :service_fee_cop, :delivery_fee_cop, :discount_cop, :total_cop,
                        :distance_km, :payment_method, :cash_change_for, 'Recibido', :courier_id
                    )";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':id' => $orderId,
                ':customer_name' => $data['customer_name'],
                ':customer_phone' => $data['customer_phone'],
                ':neighborhood_id' => $data['neighborhood_id'],
                ':delivery_address' => $data['delivery_address'],
                ':subtotal_cop' => $data['subtotal_cop'],
                ':service_fee_cop' => $data['service_fee_cop'] ?? 1500,
                ':delivery_fee_cop' => $data['delivery_fee_cop'] ?? 5500,
                ':discount_cop' => $data['discount_cop'] ?? 0,
                ':total_cop' => $data['total_cop'],
                ':distance_km' => $data['distance_km'] ?? 2.8,
                ':payment_method' => $data['payment_method'],
                ':cash_change_for' => !empty($data['cash_change_for']) ? $data['cash_change_for'] : null,
                ':courier_id' => $courierId
            ]);

            $itemInsert = $this->db->prepare("INSERT INTO order_items (
                            order_id, product_id, product_name, quantity, unit_price, line_total, notes
                         ) VALUES (
                            :order_id, :product_id, :product_name, :quantity, :unit_price, :line_total, :notes
                         )");

            $toppingInsert = $this->db->prepare("INSERT INTO order_item_toppings (
                                order_item_id, topping_id, topping_name, topping_price, quantity
                             ) VALUES (
                                :order_item_id, :topping_id, :topping_name, :topping_price, :quantity
                             )");

            foreach ($items as $item) {
                $itemInsert->execute([
                    ':order_id' => $orderId,
                    ':product_id' => $item['product_id'],
                    ':product_name' => $item['product_name'],
                    ':quantity' => $item['quantity'],
                    ':unit_price' => $item['unit_price'],
                    ':line_total' => $item['line_total'],
                    ':notes' => $item['notes'] ?? ''
                ]);
                $orderItemId = $this->db->lastInsertId();

                if (!empty($item['toppings']) && is_array($item['toppings'])) {
                    foreach ($item['toppings'] as $top) {
                        $toppingInsert->execute([
                            ':order_item_id' => $orderItemId,
                            ':topping_id' => $top['id'],
                            ':topping_name' => $top['name'],
                            ':topping_price' => $top['price'],
                            ':quantity' => $top['quantity'] ?? 1
                        ]);
                    }
                }
            }

            $this->db->commit();
            return $orderId;
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Error creating order: " . $e->getMessage());
            return null;
        }
    }

    public function updateStatus(string $orderId, string $status): bool {
        if (!$this->db) return false;

        $stmt = $this->db->prepare("UPDATE orders SET status = :status WHERE id = :id");
        return $stmt->execute([':status' => $status, ':id' => $orderId]);
    }
}
