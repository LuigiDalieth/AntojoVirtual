<?php
namespace App\Services;

/**
 * Patrón Strategy & Factory para Pasarela de Pagos (Payment Gateway)
 * Simulación y procesamiento de pagos en Pesos Colombianos (COP) para Neiva
 */
interface PaymentGatewayInterface {
    public function processPayment(array $paymentData): array;
}

class NequiPaymentGateway implements PaymentGatewayInterface {
    public function processPayment(array $paymentData): array {
        $phone = $paymentData['nequi_phone'] ?? $paymentData['customer_phone'] ?? '';
        $amount = (int)($paymentData['total_cop'] ?? 0);

        if (strlen(preg_replace('/[^0-9]/', '', $phone)) < 10) {
            return [
                'success' => false,
                'message' => 'El número celular para cobro por Nequi debe tener 10 dígitos.'
            ];
        }

        // Generar referencia única de pasarela
        $ref = 'NEQ-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        return [
            'success' => true,
            'transaction_id' => $ref,
            'gateway' => 'Nequi Colombia',
            'amount' => $amount,
            'status' => 'Aprobado',
            'message' => "Notificación push enviada exitosamente a la App Nequi ({$phone}). Pago debitado."
        ];
    }
}

class DaviplataPaymentGateway implements PaymentGatewayInterface {
    public function processPayment(array $paymentData): array {
        $phone = $paymentData['daviplata_phone'] ?? $paymentData['customer_phone'] ?? '';
        $amount = (int)($paymentData['total_cop'] ?? 0);

        $ref = 'DVI-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        return [
            'success' => true,
            'transaction_id' => $ref,
            'gateway' => 'DaviPlata',
            'amount' => $amount,
            'status' => 'Aprobado',
            'message' => "Transacción DaviPlata aprobada desde el número {$phone}."
        ];
    }
}

class CardPaymentGateway implements PaymentGatewayInterface {
    public function processPayment(array $paymentData): array {
        $cardNumber = preg_replace('/[^0-9]/', '', $paymentData['card_number'] ?? '');
        $cvv = $paymentData['card_cvv'] ?? '';
        $holder = trim($paymentData['card_holder'] ?? '');

        if (strlen($cardNumber) < 15) {
            return [
                'success' => false,
                'message' => 'Número de tarjeta inválido. Debe tener al menos 15 o 16 dígitos.'
            ];
        }

        if (strlen($cvv) < 3) {
            return [
                'success' => false,
                'message' => 'Código de seguridad (CVV) inválido.'
            ];
        }

        $last4 = substr($cardNumber, -4);
        $franchise = str_starts_with($cardNumber, '4') ? 'Visa' : (str_starts_with($cardNumber, '5') ? 'Mastercard' : 'Tarjeta Débito/Crédito');
        $ref = 'CARD-' . strtoupper(substr(uniqid(), -7));

        return [
            'success' => true,
            'transaction_id' => $ref,
            'gateway' => "Pasarela Bancaria ({$franchise} •••• {$last4})",
            'amount' => (int)($paymentData['total_cop'] ?? 0),
            'status' => 'Aprobado',
            'message' => "Cobro a {$holder} ({$franchise} terminada en {$last4}) aprobado con éxito."
        ];
    }
}

class CashPaymentGateway implements PaymentGatewayInterface {
    public function processPayment(array $paymentData): array {
        $changeFor = !empty($paymentData['cash_change_for']) ? (int)$paymentData['cash_change_for'] : null;
        $total = (int)($paymentData['total_cop'] ?? 0);

        if ($changeFor && $changeFor < $total) {
            return [
                'success' => false,
                'message' => "El monto con el que pagas ($" . number_format($changeFor, 0, ',', '.') . ") no puede ser menor al total del pedido ($" . number_format($total, 0, ',', '.') . ")."
            ];
        }

        return [
            'success' => true,
            'transaction_id' => 'CASH-' . strtoupper(substr(uniqid(), -5)),
            'gateway' => 'Efectivo contra entrega',
            'amount' => $total,
            'status' => 'Pendiente de cobro en entrega',
            'message' => $changeFor ? "El repartidor llevará cambio de $" . number_format($changeFor - $total, 0, ',', '.') . " COP." : "Pago exacto en efectivo al recibir."
        ];
    }
}

/**
 * Patrón Factory para instanciar la pasarela correspondiente
 */
class PaymentGatewayFactory {
    public static function create(string $method): PaymentGatewayInterface {
        switch ($method) {
            case 'Nequi':
                return new NequiPaymentGateway();
            case 'DaviPlata':
                return new DaviplataPaymentGateway();
            case 'Tarjeta':
                return new CardPaymentGateway();
            case 'Efectivo':
            default:
                return new CashPaymentGateway();
        }
    }
}
