<?php
namespace App\Services;

use App\Models\BusinessRepository;

/**
 * Servicio de Cálculo de Envíos Dinámico basado en coordenadas de Neiva
 * Aplica fórmula Haversine para distancias reales entre comunas
 */
class DeliveryCalculatorService {
    private BusinessRepository $businessRepo;

    // Coordenadas fijas por comuna/barrio en Neiva
    private array $neighborhoodCoords = [
        'altico'   => ['lat' => 2.9273, 'lng' => -75.2819, 'name' => 'El Altico (Comuna 3)'],
        'quirinal' => ['lat' => 2.9385, 'lng' => -75.2862, 'name' => 'El Quirinal (Comuna 2)'],
        'ico'      => ['lat' => 2.9512, 'lng' => -75.2940, 'name' => 'Ipanema / Santa Inés (Comuna 1)'],
        'canaima'  => ['lat' => 2.9055, 'lng' => -75.2765, 'name' => 'Canaima (Comuna 6 · Sur)'],
        'la-rioja' => ['lat' => 2.9310, 'lng' => -75.2640, 'name' => 'La Rioja (Comuna 5 · Oriente)'],
    ];

    public function __construct() {
        $this->businessRepo = new BusinessRepository();
    }

    /**
     * Calcula la distancia Haversine en kilómetros
     */
    public function calculateDistanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float {
        $earthRadiusKm = 6371.0;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadiusKm * $c, 2);
    }

    /**
     * Calcula la tarifa dinámica de envío en COP
     * Base: $4.500 COP + $1.000 COP por km adicional después de 2 km
     */
    public function calculateFee(string $customerNeighborhoodId, ?string $businessId = null): array {
        $customerCoords = $this->neighborhoodCoords[$customerNeighborhoodId] ?? $this->neighborhoodCoords['altico'];

        $bizLat = 2.9385;
        $bizLng = -75.2862;

        if ($businessId) {
            $biz = $this->businessRepo->findById($businessId);
            if ($biz && !empty($biz['lat']) && !empty($biz['lng'])) {
                $bizLat = (float)$biz['lat'];
                $bizLng = (float)$biz['lng'];
            }
        }

        $distanceKm = $this->calculateDistanceKm($bizLat, $bizLng, $customerCoords['lat'], $customerCoords['lng']);
        if ($distanceKm < 1.0) $distanceKm = 1.2;

        $baseFee = 4500;
        $extraKm = max(0, $distanceKm - 2.0);
        $deliveryFee = (int)($baseFee + ($extraKm * 1000));
        
        // Redondear a múltiplos de 500 COP
        $deliveryFee = (int)(ceil($deliveryFee / 500) * 500);

        // Estimar tiempo de entrega: 15 min preparación + 5 min por km
        $estimatedMinutes = (int)(20 + ceil($distanceKm * 4));

        return [
            'neighborhood_id' => $customerNeighborhoodId,
            'neighborhood_name' => $customerCoords['name'],
            'distance_km' => $distanceKm,
            'delivery_fee_cop' => $deliveryFee,
            'estimated_minutes' => $estimatedMinutes
        ];
    }
}
