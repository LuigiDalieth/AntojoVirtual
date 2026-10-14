<?php
namespace App\Controllers;

use App\Models\ProductRepository;
use App\Models\BusinessRepository;
use App\Config\Database;

/**
 * Controlador Principal del Catálogo y Restaurantes
 */
class HomeController extends BaseController {
    private ProductRepository $productRepo;
    private BusinessRepository $businessRepo;

    public function __construct() {
        $this->productRepo = new ProductRepository();
        $this->businessRepo = new BusinessRepository();
    }

    public function index(): void {
        $category = $_GET['category'] ?? 'Todas';
        $businessId = $_GET['business'] ?? null;
        $search = $_GET['q'] ?? null;

        $dbConnected = Database::getInstance()->getConnection() !== null;
        $products = $dbConnected ? $this->productRepo->getAll($category, $businessId, $search) : [];
        $businesses = $dbConnected ? $this->businessRepo->getAll() : [];
        $neighborhoods = $dbConnected ? $this->businessRepo->getAllNeighborhoods() : [];

        $this->render('home/index', [
            'products' => $products,
            'businesses' => $businesses,
            'neighborhoods' => $neighborhoods,
            'currentCategory' => $category,
            'currentBusiness' => $businessId,
            'search' => $search,
            'dbConnected' => $dbConnected
        ]);
    }

    public function productModal(): void {
        $id = $_GET['id'] ?? '';
        $product = $this->productRepo->findById($id);

        if (!$product) {
            $this->json(['error' => 'Producto no encontrado'], 404);
        }

        $this->json($product);
    }
}
