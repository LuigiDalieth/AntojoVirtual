<?php
namespace App\Controllers;

/**
 * Controlador Base MVC
 */
abstract class BaseController {
    protected function render(string $view, array $data = []): void {
        extract($data);
        $viewPath = __DIR__ . '/../views/' . $view . '.php';

        if (file_exists($viewPath)) {
            require_once __DIR__ . '/../views/partials/header.php';
            require_once $viewPath;
            require_once __DIR__ . '/../views/partials/footer.php';
        } else {
            echo "Vista no encontrada: " . htmlspecialchars($view);
        }
    }

    protected function json(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
        exit;
    }

    protected function redirect(string $url): void {
        header("Location: " . $url);
        exit;
    }
}
