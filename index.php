<?php
/**
 * Antojo Virtual — Enrutador y Punto de Entrada Principal (Front Controller Pattern)
 * Gastronomía Local de Neiva
 */

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Autoloader PSR-4 simple para el proyecto
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/app/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

use App\Controllers\HomeController;
use App\Controllers\OrderController;
use App\Controllers\AuthController;

// Despacho de rutas según el parámetro 'action'
$action = $_GET['action'] ?? 'home';

switch ($action) {
    case 'home':
        $controller = new HomeController();
        $controller->index();
        break;

    case 'product_modal':
        $controller = new HomeController();
        $controller->productModal();
        break;

    case 'tracking':
        $controller = new OrderController();
        $controller->tracking();
        break;

    case 'checkout':
        $controller = new OrderController();
        $controller->checkout();
        break;

    case 'order_status':
        $controller = new OrderController();
        $controller->updateStatus();
        break;

    case 'login':
        $controller = new AuthController();
        $controller->login();
        break;

    case 'logout':
        $controller = new AuthController();
        $controller->logout();
        break;

    default:
        $controller = new HomeController();
        $controller->index();
        break;
}
