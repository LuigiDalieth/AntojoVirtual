<?php
namespace App\Services;

/**
 * Servicio de Cupones y Descuentos
 */
class CouponService {
    private array $availableCoupons = [
        'NEIVAOPITA' => [
            'type' => 'percentage',
            'value' => 15,
            'description' => '15% de descuento especial en tu pedido',
            'min_subtotal' => 25000
        ],
        'ANTOJO5K' => [
            'type' => 'fixed',
            'value' => 5000,
            'description' => '$5.000 COP de descuento de bienvenida',
            'min_subtotal' => 30000
        ],
        'SANPEDRINO' => [
            'type' => 'free_shipping',
            'value' => 5500,
            'description' => '¡Envío Gratis en cualquier comuna de Neiva!',
            'min_subtotal' => 35000
        ]
    ];

    public function applyCoupon(string $code, int $subtotal, int $deliveryFee): array {
        $cleanCode = strtoupper(trim($code));

        if (!isset($this->availableCoupons[$cleanCode])) {
            return [
                'valid' => false,
                'message' => 'Cupón no válido o expirado. Prueba con NEIVAOPITA o ANTOJO5K.'
            ];
        }

        $coupon = $this->availableCoupons[$cleanCode];

        if ($subtotal < $coupon['min_subtotal']) {
            return [
                'valid' => false,
                'message' => "El cupón requiere una compra mínima de $" . number_format($coupon['min_subtotal'], 0, ',', '.') . " COP."
            ];
        }

        $discount = 0;
        if ($coupon['type'] === 'percentage') {
            $discount = (int)round(($subtotal * $coupon['value']) / 100);
        } elseif ($coupon['type'] === 'fixed') {
            $discount = $coupon['value'];
        } elseif ($coupon['type'] === 'free_shipping') {
            $discount = $deliveryFee;
        }

        return [
            'valid' => true,
            'code' => $cleanCode,
            'discount_cop' => $discount,
            'description' => $coupon['description'],
            'message' => "¡Cupón {$cleanCode} aplicado con éxito!"
        ];
    }
}
