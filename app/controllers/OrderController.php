<?php
namespace App\Controllers;

use App\Models\OrderRepository;
use App\Models\BusinessRepository;
use App\Models\ProductRepository;

/**
 * Controlador de Pedidos, Checkout y Seguimiento
 */
class OrderController extends BaseController {
    private OrderRepository $orderRepo;
    private BusinessRepository $businessRepo;

    public function __construct() {
        $this->orderRepo = new OrderRepository();
        $this->businessRepo = new BusinessRepository();
    }

    public function tracking(): void {
        $orderId = $_GET['id'] ?? null;
        $order = null;

        if ($orderId) {
            $order = $this->orderRepo->findById($orderId);
        }

        $allOrders = $this->orderRepo->getAll();

        $this->render('orders/tracking', [
            'order' => $order,
            'allOrders' => $allOrders,
            'searchId' => $orderId
        ]);
    }

    public function checkout(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('index.php');
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $items = $input['items'] ?? [];
        if (empty($items)) {
            $this->json(['success' => false, 'message' => 'El carrito está vacío'], 400);
            return;
        }

        $method = $input['payment_method'] ?? 'Efectivo';
        
        $orderData = [
            'customer_name' => trim($input['customer_name'] ?? 'Cliente Neiva'),
            'customer_phone' => trim($input['customer_phone'] ?? '3000000000'),
            'neighborhood_id' => $input['neighborhood_id'] ?? 'altico',
            'delivery_address' => trim($input['delivery_address'] ?? 'Dirección no especificada'),
            'subtotal_cop' => (int)($input['subtotal_cop'] ?? 0),
            'service_fee_cop' => (int)($input['service_fee_cop'] ?? 1500),
            'delivery_fee_cop' => (int)($input['delivery_fee_cop'] ?? 5500),
            'discount_cop' => (int)($input['discount_cop'] ?? 0),
            'total_cop' => (int)($input['total_cop'] ?? 0),
            'distance_km' => (float)($input['distance_km'] ?? 2.8),
            'payment_method' => $method,
            'cash_change_for' => !empty($input['cash_change_for']) ? (int)$input['cash_change_for'] : null,
            // Datos adicionales de pasarela
            'nequi_phone' => $input['nequi_phone'] ?? null,
            'daviplata_phone' => $input['daviplata_phone'] ?? null,
            'card_number' => $input['card_number'] ?? null,
            'card_holder' => $input['card_holder'] ?? null,
            'card_cvv' => $input['card_cvv'] ?? null
        ];

        // Procesar pago con Pasarela de Pagos (Patrón Factory & Strategy)
        $gateway = \App\Services\PaymentGatewayFactory::create($method);
        $paymentResult = $gateway->processPayment($orderData);

        if (!$paymentResult['success']) {
            $this->json([
                'success' => false,
                'message' => $paymentResult['message'] ?? 'El pago fue declinado por la pasarela.'
            ], 422);
            return;
        }

        $orderData['payment_status'] = $paymentResult['status'] === 'Aprobado' ? 'Aprobado' : 'Pendiente';
        $orderData['transaction_id'] = $paymentResult['transaction_id'] ?? null;

        $orderId = $this->orderRepo->createOrder($orderData, $items);

        if ($orderId) {
            $this->json([
                'success' => true,
                'order_id' => $orderId,
                'transaction_id' => $paymentResult['transaction_id'] ?? null,
                'payment_gateway' => $paymentResult['gateway'] ?? $method,
                'payment_message' => $paymentResult['message'] ?? '',
                'message' => '¡Pedido y pago procesados exitosamente!'
            ]);
        } else {
            $this->json([
                'success' => false,
                'message' => 'Hubo un error al registrar el pedido en la base de datos.'
            ], 500);
        }
    }

    public function updateStatus(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $orderId = $input['order_id'] ?? null;
        $status = $input['status'] ?? null;

        if (!$orderId || !$status) {
            $this->json(['success' => false, 'message' => 'Datos incompletos'], 400);
            return;
        }

        $success = $this->orderRepo->updateStatus($orderId, $status);
        $this->json(['success' => $success]);
    }
}
