<?php
namespace App\Services;

/**
 * Servicio de Notificaciones y Mensajería directa a WhatsApp para Neiva
 */
class NotificationService {
    /**
     * Genera enlace oficial wa.me con mensaje preformateado
     */
    public function generateWhatsAppLink(array $order): string {
        $phone = preg_replace('/[^0-9]/', '', $order['customer_phone'] ?? '573000000000');
        if (strlen($phone) === 10) {
            $phone = '57' . $phone;
        }

        $itemsSummary = "";
        if (!empty($order['items']) && is_array($order['items'])) {
            foreach ($order['items'] as $item) {
                $name = $item['product_name'] ?? 'Producto';
                $qty = $item['quantity'] ?? 1;
                $itemsSummary .= "• {$qty}x {$name}%0A";
            }
        }

        $totalFormatted = number_format($order['total_cop'] ?? 0, 0, ',', '.');
        $msg = "🍔 *Antojo Virtual Neiva — Confirmación de Pedido*%0A%0A"
             . "*Pedido:* #{$order['id']}%0A"
             . "*Cliente:* {$order['customer_name']}%0A"
             . "*Dirección:* {$order['delivery_address']}%0A"
             . "*Método de Pago:* {$order['payment_method']}%0A%0A"
             . "*Detalle de productos:*%0A{$itemsSummary}%0A"
             . "*Total a Pagar:* \${$totalFormatted} COP%0A%0A"
             . "🛵 ¡Tu repartidor se encuentra en camino! Puedes rastrear en vivo desde nuestra web.";

        return "https://wa.me/{$phone}?text={$msg}";
    }
}
