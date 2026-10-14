<section class="tracking-container">
    <div class="tracking-header">
        <h2><i class="fa-solid fa-route"></i> Rastreo de Domicilios en Tiempo Real</h2>
        <p>Sigue el recorrido de tu antojo por las calles de Neiva hasta tu puerta</p>
    </div>

    <!-- Buscador de pedido -->
    <div class="tracking-search-box">
        <form action="index.php" method="GET" class="tracking-form">
            <input type="hidden" name="action" value="tracking">
            <input type="text" name="id" placeholder="Ingresa tu ID de pedido (ej: ORD-1A2B3C)..." value="<?= htmlspecialchars($searchId ?? '') ?>" required>
            <button type="submit" class="btn-track-submit"><i class="fa-solid fa-magnifying-glass"></i> Consultar</button>
        </form>
    </div>

    <?php if ($order): ?>
        <div class="order-detail-card">
            <div class="order-card-top">
                <div>
                    <span class="badge-order-id">Pedido #<?= htmlspecialchars($order['id']) ?></span>
                    <span class="order-time"><i class="fa-solid fa-clock"></i> <?= date('g:i A - d M Y', strtotime($order['created_at'])) ?></span>
                </div>
                <div class="status-indicator status-<?= strtolower(str_replace(' ', '-', $order['status'])) ?>">
                    <?= htmlspecialchars($order['status']) ?>
                </div>
            </div>

            <!-- Timeline de estados -->
            <div class="status-timeline">
                <?php
                $stages = ['Recibido', 'Preparando', 'En camino', 'Entregado'];
                $currentIndex = array_search($order['status'], $stages);
                if ($currentIndex === false) $currentIndex = 0;
                ?>
                <?php foreach ($stages as $idx => $stage): ?>
                    <div class="timeline-step <?= $idx <= $currentIndex ? 'completed' : '' ?> <?= $idx === $currentIndex ? 'current' : '' ?>">
                        <div class="step-circle">
                            <?php if ($idx <= $currentIndex): ?>
                                <i class="fa-solid fa-check"></i>
                            <?php else: ?>
                                <?= $idx + 1 ?>
                            <?php endif; ?>
                        </div>
                        <span class="step-label"><?= $stage ?></span>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Detalles del Domiciliario asignado -->
            <?php if (!empty($order['courier_name'])): ?>
                <div class="courier-card">
                    <div class="courier-avatar">
                        <i class="fa-solid fa-motorcycle"></i>
                    </div>
                    <div class="courier-info">
                        <h4><?= htmlspecialchars($order['courier_name']) ?></h4>
                        <p><i class="fa-solid fa-shield-cat"></i> <?= htmlspecialchars($order['vehicle'] ?? 'Moto') ?> · Placa: <strong><?= htmlspecialchars($order['plate'] ?? 'N/A') ?></strong></p>
                        <span class="courier-rating"><i class="fa-solid fa-star"></i> <?= $order['courier_rating'] ?? '5.0' ?> Calificación</span>
                    </div>
                    <?php if (!empty($order['courier_phone'])): ?>
                        <a href="tel:<?= htmlspecialchars($order['courier_phone']) ?>" class="btn-call-courier">
                            <i class="fa-solid fa-phone"></i> Llamar
                        </a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <!-- Resumen del Pedido -->
            <div class="order-breakdown-card">
                <h4>Detalle de Productos</h4>
                <ul class="order-items-list">
                    <?php foreach ($order['items'] as $item): ?>
                        <li class="order-item-row">
                            <div class="item-title-qty">
                                <span class="qty-badge"><?= $item['quantity'] ?>x</span>
                                <strong><?= htmlspecialchars($item['product_name']) ?></strong>
                                <?php if (!empty($item['toppings'])): ?>
                                    <span class="item-toppings-text">
                                        (<?= implode(', ', array_map(function($t) { return $t['topping_name']; }, $item['toppings'])) ?>)
                                    </span>
                                <?php endif; ?>
                                <?php if (!empty($item['notes'])): ?>
                                    <small class="item-notes">Nota: <?= htmlspecialchars($item['notes']) ?></small>
                                <?php endif; ?>
                            </div>
                            <span class="item-line-total">$<?= number_format($item['line_total'], 0, ',', '.') ?> COP</span>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <div class="totals-summary">
                    <div class="summary-line"><span>Dirección de Entrega:</span> <strong><?= htmlspecialchars($order['delivery_address']) ?> (<?= htmlspecialchars($order['neighborhood_name']) ?>)</strong></div>
                    <div class="summary-line"><span>Método de Pago:</span> <strong><?= htmlspecialchars($order['payment_method']) ?></strong></div>
                    <div class="summary-line"><span>Subtotal:</span> <span>$<?= number_format($order['subtotal_cop'], 0, ',', '.') ?> COP</span></div>
                    <div class="summary-line"><span>Envío:</span> <span>$<?= number_format($order['delivery_fee_cop'], 0, ',', '.') ?> COP</span></div>
                    <div class="summary-line highlight-total"><span>Total Pagado / A Pagar:</span> <strong>$<?= number_format($order['total_cop'], 0, ',', '.') ?> COP</strong></div>
                </div>
            </div>
        </div>
    <?php elseif ($searchId): ?>
        <div class="order-not-found">
            <i class="fa-solid fa-magnifying-glass-chart"></i>
            <p>No se encontró ningún pedido con el código <strong><?= htmlspecialchars($searchId) ?></strong></p>
            <span>Verifica el código o consulta la lista de pedidos recientes abajo.</span>
        </div>
    <?php endif; ?>

    <!-- Lista de todos los pedidos recientes en el sistema -->
    <div class="recent-orders-section">
        <h3><i class="fa-solid fa-list-check"></i> Pedidos Recientes en Neiva</h3>
        <?php if (empty($allOrders)): ?>
            <p class="no-recent">Aún no se han registrado pedidos hoy en Neiva. ¡Sé el primero en ordenar!</p>
        <?php else: ?>
            <div class="orders-table-wrapper">
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Barrio</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($allOrders as $o): ?>
                            <tr>
                                <td><strong>#<?= htmlspecialchars($o['id']) ?></strong></td>
                                <td><?= htmlspecialchars($o['customer_name']) ?></td>
                                <td><?= htmlspecialchars($o['neighborhood_name'] ?? 'Neiva') ?></td>
                                <td>$<?= number_format($o['total_cop'], 0, ',', '.') ?> COP</td>
                                <td><span class="status-pill status-<?= strtolower(str_replace(' ', '-', $o['status'])) ?>"><?= $o['status'] ?></span></td>
                                <td><?= date('d/m/Y H:i', strtotime($o['created_at'])) ?></td>
                                <td>
                                    <a href="index.php?action=tracking&id=<?= urlencode($o['id']) ?>" class="btn-view-order">
                                        Rastrear
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</section>
