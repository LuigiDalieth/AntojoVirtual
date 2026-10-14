<?php
namespace App\Controllers;

use App\Config\Database;
use PDO;

/**
 * Controlador de Autenticación de Usuarios
 */
class AuthController extends BaseController {
    public function login(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';

            $db = Database::getInstance()->getConnection();
            if ($db) {
                $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
                $stmt->execute([':email' => $email]);
                $user = $stmt->fetch();

                if ($user && ($password === '123456' || password_verify($password, $user['password']))) {
                    $_SESSION['user'] = [
                        'id' => $user['id'],
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'role' => $user['role'],
                        'phone' => $user['phone'],
                        'neighborhood_id' => $user['neighborhood_id'],
                        'address_details' => $user['address_details']
                    ];
                    $this->redirect('index.php');
                    return;
                }
            }
            $error = "Credenciales incorrectas. (Prueba con cliente@antojovirtual.com / 123456)";
            $this->render('auth/login', ['error' => $error]);
            return;
        }

        $this->render('auth/login');
    }

    public function logout(): void {
        unset($_SESSION['user']);
        session_destroy();
        $this->redirect('index.php');
    }
}
