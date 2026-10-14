<!-- Hero Section con Alto Impacto Visual -->
<section class="hero-banner">
    <div class="hero-backdrop-glow"></div>
    <div class="hero-container">
        <div class="hero-content">
            <div class="hero-badge-pill">
                <span class="pulse-dot"></span>
                <span><i class="fa-solid fa-fire-flame-curved"></i> Gastronomía Artesanal Opita</span>
            </div>
            <h2 class="hero-title">
                Los mejores antojos de <span class="gradient-accent">Neiva</span> directo a tu mesa
            </h2>
            <p class="hero-description">
                Carnes al carbón, achiras huilenses, salchipapas monumentales y salsas artesanales preparadas al momento por cocinas locales apasionadas.
            </p>
            
            <div class="hero-cta-group">
                <a href="#catalogo" class="btn-hero-primary">
                    <i class="fa-solid fa-burger"></i> Explorar Menú
                </a>
                <a href="index.php?action=tracking" class="btn-hero-secondary">
                    <i class="fa-solid fa-motorcycle"></i> Rastrear Pedido
                </a>
            </div>

            <!-- Badges de confianza -->
            <div class="hero-trust-bar">
                <div class="trust-item">
                    <div class="trust-icon"><i class="fa-solid fa-stopwatch"></i></div>
                    <div>
                        <strong>25 - 35 Min</strong>
                        <small>Entrega express</small>
                    </div>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-item">
                    <div class="trust-icon"><i class="fa-solid fa-location-dot"></i></div>
                    <div>
                        <strong>Comunas de Neiva</strong>
                        <small>Cobertura total</small>
                    </div>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-item">
                    <div class="trust-icon"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                    <div>
                        <strong>Nequi / Efectivo</strong>
                        <small>Contra entrega</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="hero-visual">
            <div class="hero-image-card">
                <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80" alt="Hamburguesa Tatacoa Artesanal" class="hero-img-main">
                <div class="floating-order-tag">
                    <div class="floating-icon"><i class="fa-solid fa-bolt"></i></div>
                    <div>
                        <strong>¡Más pedido de hoy!</strong>
                        <span>Burger Tatacoa BBQ con Achiras</span>
                    </div>
                </div>
                <div class="floating-rating-tag">
                    <i class="fa-solid fa-star"></i>
                    <strong>4.9</strong>
                    <span>(150+ pedidos)</span>
                </div>
            </div>
        </div>
    </div>
</section>

<?php if (!$dbConnected): ?>
    <div class="db-alert warning">
        <div class="alert-icon-box"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="alert-text">
            <strong>Base de datos MySQL desconectada</strong>
            <p>Inicia el servicio <strong>MySQL</strong> en el panel de control de <strong>XAMPP</strong> e importa el archivo <code>database/schema.sql</code> para sincronizar pedidos y productos en tiempo real.</p>
        </div>
    </div>
<?php endif; ?>

<!-- Barra de Categorías tipo Stories / Chips Interactivos -->
<section class="categories-bar-wrapper" id="catalogo">
    <div class="categories-title-row">
        <h3><i class="fa-solid fa-layer-group"></i> Categorías Populares</h3>
        <span class="sub-label">Filtra tus gustos favoritos</span>
    </div>
    <div class="categories-bar">
        <?php
        $categories = [
            'Todas' => ['icon' => 'fa-sparkles', 'badge' => 'Todo'],
            'Hamburguesas' => ['icon' => 'fa-burger', 'badge' => 'Artesanales'],
            'Salchipapas' => ['icon' => 'fa-drumstick-bite', 'badge' => 'Monumentales'],
            'Arepas' => ['icon' => 'fa-circle-dot', 'badge' => 'De Chócolo'],
            'Alitas' => ['icon' => 'fa-fire-burner', 'badge' => 'Crujientes'],
            'Perros' => ['icon' => 'fa-hotdog', 'badge' => 'Especiales']
        ];

        foreach ($categories as $cat => $meta):
            $isActive = ($currentCategory === $cat);
            $query = $_GET;
            $query['category'] = $cat;
            $url = 'index.php?' . http_build_query($query);
        ?>
            <a href="<?= $url ?>" class="category-chip <?= $isActive ? 'active' : '' ?>">
                <span class="cat-icon-circle">
                    <i class="fa-solid <?= $meta['icon'] ?>"></i>
                </span>
                <div class="cat-text-group">
                    <span class="cat-name"><?= $cat ?></span>
                    <small class="cat-tagline"><?= $meta['badge'] ?></small>
                </div>
            </a>
        <?php endforeach; ?>
    </div>
</section>

<!-- Catálogo de Productos y Locales -->
<div class="catalog-layout">
    <!-- Columna Principal de Productos -->
    <div class="products-section">
        <div class="section-heading">
            <div>
                <h3 class="section-title">
                    <?= htmlspecialchars($currentCategory) ?> en Neiva
                    <span class="accent-dot"></span>
                </h3>
                <p class="section-desc">Selecciona tu antojo para personalizar toppings, quesos y salsas caseras</p>
            </div>
            <div class="catalog-meta-pill">
                <i class="fa-solid fa-utensils"></i> <?= count($products) ?> opciones preparadas hoy
            </div>
        </div>

        <?php if (empty($products)): ?>
            <div class="empty-products-state">
                <div class="empty-illustration">
                    <i class="fa-solid fa-bowl-food"></i>
                </div>
                <h4>¡Ups! No encontramos productos con ese filtro</h4>
                <p>Prueba buscando otra palabra clave o selecciona otra categoría de comidas rápidas.</p>
                <a href="index.php" class="btn-reset-filters">
                    <i class="fa-solid fa-arrow-rotate-left"></i> Restablecer Filtros
                </a>
            </div>
        <?php else: ?>
            <div class="products-grid">
                <?php foreach ($products as $prod): ?>
                    <article class="product-card" data-product-id="<?= $prod['id'] ?>">
                        <div class="product-media">
                            <img src="<?= htmlspecialchars($prod['image_url']) ?>" alt="<?= htmlspecialchars($prod['name']) ?>" loading="lazy">
                            <div class="media-overlay"></div>
                            
                            <?php if (!empty($prod['is_featured'])): ?>
                                <span class="badge-featured">
                                    <i class="fa-solid fa-crown"></i> Favorito
                                </span>
                            <?php endif; ?>

                            <span class="prep-badge">
                                <i class="fa-solid fa-stopwatch"></i> <?= $prod['prep_time_minutes'] ?> min
                            </span>
                        </div>
                        
                        <div class="product-info">
                            <div class="business-tag">
                                <i class="fa-solid fa-store"></i> <?= htmlspecialchars($prod['business_name']) ?>
                            </div>
                            <h4 class="product-title"><?= htmlspecialchars($prod['name']) ?></h4>
                            <p class="product-desc"><?= htmlspecialchars($prod['description']) ?></p>
                            
                            <div class="product-bottom">
                                <div class="price-box">
                                    <span class="price-caption">Precio desde</span>
                                    <span class="price-val">$<?= number_format($prod['base_price'], 0, ',', '.') ?> <small>COP</small></span>
                                </div>
                                
                                <button type="button" class="btn-customize-item" 
                                        data-id="<?= $prod['id'] ?>" 
                                        data-name="<?= htmlspecialchars($prod['name']) ?>"
                                        data-price="<?= $prod['base_price'] ?>"
                                        data-image="<?= htmlspecialchars($prod['image_url']) ?>"
                                        data-desc="<?= htmlspecialchars($prod['description']) ?>"
                                        data-business="<?= htmlspecialchars($prod['business_name']) ?>">
                                    <i class="fa-solid fa-plus"></i>
                                    <span>Pedir</span>
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
            <div class="sidebar-header-icon"><i class="fa-solid fa-fire"></i></div>
            <div>
                <h4>Cocinas Aliadas</h4>
                <p>Restaurantes activos en Neiva</p>
            </div>
        </div>

        <div class="businesses-list">
            <?php foreach ($businesses as $b): ?>
                <div class="business-card <?= ($currentBusiness === $b['id']) ? 'active' : '' ?>">
                    <div class="business-card-media">
                        <img src="<?= htmlspecialchars($b['cover_image_url'] ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500') ?>" alt="<?= htmlspecialchars($b['name']) ?>">
                        <span class="business-open-tag <?= $b['is_open'] ? 'is-open' : 'is-closed' ?>">
                            <span class="dot"></span> <?= $b['is_open'] ? 'Abierto' : 'Cerrado' ?>
                        </span>
                    </div>

                    <div class="business-card-body">
                        <div class="business-top">
                            <h5><?= htmlspecialchars($b['name']) ?></h5>
                            <span class="rating-pill">
                                <i class="fa-solid fa-star"></i> <?= $b['rating'] ?>
                            </span>
                        </div>
                        <p class="business-spec"><?= htmlspecialchars($b['specialty']) ?></p>
                        
                        <div class="business-meta">
                            <span><i class="fa-solid fa-location-dot"></i> <?= htmlspecialchars($b['neighborhood_name']) ?></span>
                            <span><i class="fa-solid fa-motorcycle"></i> Min: $<?= number_format($b['min_order_cop'] ?? 18000, 0, ',', '.') ?></span>
                        </div>

                        <a href="index.php?business=<?= urlencode($b['id']) ?>" class="view-store-link">
                            <span>Ver menú del local</span>
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Banner Promocional Local -->
        <div class="promo-sidebar-banner">
            <div class="promo-icon"><i class="fa-solid fa-gift"></i></div>
            <div class="promo-text">
                <h5>¿Tienes un restaurante en Neiva?</h5>
                <p>Únete a nuestra plataforma y recibe pedidos directamente a domicilio.</p>
                <a href="index.php?action=login" class="btn-promo-link">Conectar mi negocio</a>
            </div>
        </div>
    </aside>
</div>
