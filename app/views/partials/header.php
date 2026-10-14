<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$currentUser = $_SESSION['user'] ?? null;
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Antojo Virtual — Gastronomía Artesanal de Neiva</title>
    <!-- Modern Typography: Plus Jakarta Sans & Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- FontAwesome 6 Pro-style icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom Design System Stylesheet -->
    <link rel="stylesheet" href="public/css/style.css">
</head>
<body>
    <!-- Top Announcement Bar -->
    <div class="top-announcement">
        <div class="announcement-content">
            <span><i class="fa-solid fa-sparkles"></i> <strong>¡Pide ahora en Neiva!</strong> Envíos express a todas las comunas con domiciliarios locales</span>
            <span class="delivery-time-pill"><i class="fa-solid fa-clock"></i> 25-35 min promedio</span>
        </div>
    </div>

    <!-- Header Glassmorphism -->
    <header class="app-header">
        <div class="header-container">
            <a href="index.php" class="brand-logo">
                <div class="brand-icon-wrapper">
                    <span class="brand-icon"><i class="fa-solid fa-burger"></i></span>
                    <span class="brand-glow"></span>
                </div>
                <div class="brand-text">
                    <h1>Antojo<span class="gradient-text">Virtual</span></h1>
                    <span class="brand-subtitle"><i class="fa-solid fa-location-dot"></i> Neiva, Huila</span>
                </div>
            </a>

            <!-- Search Bar in Header -->
            <form action="index.php" method="GET" class="header-search">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" name="q" placeholder="¿Qué se te antoja hoy? Hamburguesa, arepa, salchipapa..." value="<?= htmlspecialchars($_GET['q'] ?? '') ?>">
                <?php if (!empty($_GET['category'])): ?>
                    <input type="hidden" name="category" value="<?= htmlspecialchars($_GET['category']) ?>">
                <?php endif; ?>
                <button type="submit" class="search-btn"><i class="fa-solid fa-arrow-right"></i></button>
            </form>

            <!-- Navigation Actions -->
            <nav class="header-actions">
                <a href="index.php" class="nav-link <?= (!isset($_GET['action']) || $_GET['action'] === 'home') ? 'active' : '' ?>">
                    <i class="fa-solid fa-utensils"></i> <span>Menú</span>
                </a>
                <a href="index.php?action=tracking" class="nav-link <?= (($_GET['action'] ?? '') === 'tracking') ? 'active' : '' ?>">
                    <i class="fa-solid fa-route"></i> <span>Rastreo</span>
                </a>

                <!-- Cart Button with Floating Glow -->
                <button type="button" class="cart-trigger-btn" id="openCartBtn" aria-label="Ver carrito de compras">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span class="cart-badge" id="cartBadgeCount">0</span>
                    <span class="cart-total-badge" id="headerCartTotal">$0</span>
                </button>

                <!-- User Profile / Login -->
                <?php if ($currentUser): ?>
                    <div class="user-pill">
                        <div class="avatar-circle">
                            <?= strtoupper(substr($currentUser['name'], 0, 1)) ?>
                        </div>
                        <div class="user-info-text">
                            <span class="user-name"><?= htmlspecialchars(explode(' ', $currentUser['name'])[0]) ?></span>
                            <span class="user-role-badge"><?= htmlspecialchars($currentUser['role'] ?? 'Cliente') ?></span>
                        </div>
                        <a href="index.php?action=logout" class="logout-link" title="Cerrar sesión"><i class="fa-solid fa-arrow-right-from-bracket"></i></a>
                    </div>
                <?php else: ?>
                    <a href="index.php?action=login" class="btn-login">
                        <i class="fa-regular fa-user"></i> <span>Ingresar</span>
                    </a>
                <?php endif; ?>
            </nav>
        </div>
    </header>

    <main class="main-wrapper">
