<!-- Hero Banner de Neiva -->
<section class="hero-banner">
    <div class="hero-overlay"></div>
    <div class="hero-content">
        <span class="hero-tag"><i class="fa-solid fa-fire"></i> Sabor 100% Opita</span>
        <h2>Los mejores antojos nocturnos de Neiva directo a tu puerta</h2>
        <p>Hamburguesas con achiras, salchipapas monumentales, arepas de chócolo y alitas crujientes preparadas al instante.</p>
        <div class="hero-features">
            <span><i class="fa-solid fa-stopwatch"></i> Preparación en 20-30 min</span>
            <span><i class="fa-solid fa-map-location-dot"></i> Cobertura en toda Neiva</span>
            <span><i class="fa-solid fa-shield-halved"></i> Pago seguro contra entrega</span>
        </div>
    </div>
</section>

<?php if (!$dbConnected): ?>
    <div class="db-alert warning">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div>
            <strong>Base de datos no detectada o MySQL detenido</strong>
            <p>Asegúrate de iniciar <strong>MySQL</strong> en el Panel de Control de <strong>XAMPP</strong> e importar el archivo <code>database/schema.sql</code>.</p>
        </div>
    </div>
<?php endif; ?>

<!-- Filtro de Categorías -->
<section class="categories-bar">
    <?php
    $categories = ['Todas', 'Hamburguesas', 'Salchipapas', 'Arepas', 'Alitas', 'Perros'];
    foreach ($categories as $cat):
        $isActive = ($currentCategory === $cat);
        $url = 'index.php?' . http_build_query(array_merge($_GET, ['category' => $cat]));
    ?>
        <a href="<?= $url ?>" class="category-chip <?= $isActive ? 'active' : '' ?>">
            <?php
            switch($cat) {
                case 'Hamburguesas': echo '<i class="fa-solid fa-burger"></i>'; break;
                case 'Salchipapas': echo '<i class="fa-solid fa-drumstick-bite"></i>'; break;
                case 'Arepas': echo '<i class="fa-solid fa-circle-dot"></i>'; break;
                case 'Alitas': echo '<i class="fa-solid fa-fire-burner"></i>'; break;
                case 'Perros': echo '<i class="fa-solid fa-hotdog"></i>'; break;
                default: echo '<i class="fa-solid fa-sparkles"></i>'; break;
            }
            ?>
            <span><?= $cat ?></span>
        </a>
    <?php endforeach; ?>
</section>

<!-- Catálogo de Productos y Locales -->
<div class="catalog-layout">
    <!-- Columna de Productos -->
    <div class="products-section">
        <div class="section-heading">
            <div>
                <h3><?= htmlspecialchars($currentCategory) ?> disponibles hoy</h3>
                <p>Hechos al carbón y con ingredientes frescos de la región</p>
            </div>
            <span class="items-count"><?= count($products) ?> opciones encontradas</span>
        </div>

        <?php if (empty($products)): ?>
            <div class="empty-products-state">
                <i class="fa-solid fa-utensils"></i>
                <p>No se encontraron productos en esta categoría o búsqueda.</p>
                <a href="index.php" class="btn-reset-filters">Ver todo el catálogo</a>
            </div>
        <?php else: ?>
            <div class="products-grid">
                <?php foreach ($products as $prod): ?>
                    <article class="product-card" data-product-id="<?= $prod['id'] ?>">
                        <div class="product-media">
                            <img src="<?= htmlspecialchars($prod['image_url']) ?>" alt="<?= htmlspecialchars($prod['name']) ?>" loading="lazy">
                            <?php if (!empty($prod['is_featured'])): ?>
                                <span class="badge-featured"><i class="fa-solid fa-star"></i> Destacado</span>
                            <?php endif; ?>
                            <span class="prep-badge"><i class="fa-solid fa-clock"></i> <?= $prod['prep_time_minutes'] ?> min</span>
                        </div>
                        <div class="product-info">
                            <div class="business-tag">
                                <i class="fa-solid fa-store"></i> <?= htmlspecialchars($prod['business_name']) ?>
                            </div>
                            <h4 class="product-title"><?= htmlspecialchars($prod['name']) ?></h4>
                            <p class="product-desc"><?= htmlspecialchars($prod['description']) ?></p>
                            
                            <div class="product-bottom">
                                <div class="price-box">
                                    <span class="price-val">$<?= number_format($prod['base_price'], 0, ',', '.') ?> COP</span>
                                </div>
                                <button type="button" class="btn-customize-item" 
                                        data-id="<?= $prod['id'] ?>" 
                                        data-name="<?= htmlspecialchars($prod['name']) ?>"
                                        data-price="<?= $prod['base_price'] ?>"
                                        data-image="<?= htmlspecialchars($prod['image_url']) ?>"
                                        data-desc="<?= htmlspecialchars($prod['description']) ?>"
                                        data-business="<?= htmlspecialchars($prod['business_name']) ?>">
                                    <i class="fa-solid fa-plus"></i> Personalizar
                                </button>
                            </div>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- Columna Lateral de Restaurantes / Locales Aliados -->
    <aside class="sidebar-businesses">
        <div class="sidebar-header">
            <h4><i class="fa-solid fa-shop"></i> Locales en Neiva</h4>
            <p>Cocinas artesanales aliadas</p>
        </div>

        <div class="businesses-list">
            <?php foreach ($businesses as $b): ?>
                <div class="business-card <?= ($currentBusiness === $b['id']) ? 'active' : '' ?>">
                    <div class="business-top">
                        <h5><?= htmlspecialchars($b['name']) ?></h5>
                        <span class="rating-pill"><i class="fa-solid fa-star"></i> <?= $b['rating'] ?></span>
                    </div>
                    <p class="business-spec"><?= htmlspecialchars($b['specialty']) ?></p>
                    <div class="business-meta">
                        <span><i class="fa-solid fa-location-dot"></i> <?= htmlspecialchars($b['neighborhood_name']) ?></span>
                        <span class="status-open <?= $b['is_open'] ? 'open' : 'closed' ?>">
                            <?= $b['is_open'] ? 'Abierto' : 'Cerrado' ?>
                        </span>
                    </div>
                    <a href="index.php?business=<?= urlencode($b['id']) ?>" class="view-store-link">
                        Ver menú del local <i class="fa-solid fa-chevron-right"></i>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    </aside>
</div>
