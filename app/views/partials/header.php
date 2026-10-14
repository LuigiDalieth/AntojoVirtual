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
    <title>Antojo Virtual — Gastronomía Local de Neiva</title>
    <!-- Modern Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- FontAwesome for Premium Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom Design System Stylesheet -->
    <link rel="stylesheet" href="public/css/style.css">
</head>
<body>
    <!-- Top Bar with Neiva Identity -->
    <header class="app-header">
        <div class="header-container">
            <a href="index.php" class="brand-logo">
                <span class="brand-icon"><i class="fa-solid fa-burger"></i></span>
                <div class="brand-text">
                    <h1>Antojo Virtual</h1>
                    <span class="brand-subtitle"><i class="fa-solid fa-location-dot"></i> Neiva, Huila</span>
                </div>
            </a>

            <!-- Search Bar in Header -->
            <form action="index.php" method="GET" class="header-search">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" name="q" placeholder="Buscar hamburguesas, salchipapas, arepas..." value="<?= htmlspecialchars($_GET['q'] ?? '') ?>">
                <?php if (!empty($_GET['category'])): ?>
                    <input type="hidden" name="category" value="<?= htmlspecialchars($_GET['category']) ?>">
                <?php endif; ?>
            </form>

            <!-- Navigation Actions -->
            <nav class="header-actions">
                <a href="index.php" class="nav-link <?= !isset($_GET['action']) ? 'active' : '' ?>">
                    <i class="fa-solid fa-utensils"></i> Menú
                </a>
                <a href="index.php?action=tracking" class="nav-link <?= (($_GET['action'] ?? '') === 'tracking') ? 'active' : '' ?>">
                    <i class="fa-solid fa-route"></i> Domicilios
                </a>

                <!-- Cart Button -->
                <button type="button" class="cart-trigger-btn" id="openCartBtn">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span class="cart-badge" id="cartBadgeCount">0</span>
                </button>

                <!-- User profile / login -->
                <?php if ($currentUser): ?>
                    <div class="user-pill">
                        <i class="fa-solid fa-circle-user"></i>
                        <span><?= htmlspecialchars(explode(' ', $currentUser['name'])[0]) ?></span>
                        <a href="index.php?action=logout" class="logout-link" title="Cerrar sesión"><i class="fa-solid fa-arrow-right-from-bracket"></i></a>
                    </div>
                <?php else: ?>
                    <a href="index.php?action=login" class="btn-login">
                        <i class="fa-solid fa-user"></i> Ingresar
                    </a>
                <?php endif; ?>
            </nav>
        </div>
    </header>

    <main class="main-wrapper">
