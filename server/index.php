<?php
// server/index.php
declare(strict_types=1);

// Enable error logging
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/logs/error.log');

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/database/Database.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/PaymentController.php';
require_once __DIR__ . '/controllers/LicenseController.php';
require_once __DIR__ . '/controllers/ZipController.php';
require_once __DIR__ . '/controllers/StatsController.php';

// Parse route from query parameter or REQUEST_URI
$route = $_GET['route'] ?? '';
if (empty($route)) {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    $relative = str_replace([$scriptDir, '/server', '/api'], '', $uri);
    $route = trim($relative, '/');
}

// If route contains embedded query string (e.g. admin/licenses?page=1), split it
if (str_contains($route, '?')) {
    [$cleanRoute, $queryString] = explode('?', $route, 2);
    $route = $cleanRoute;
    parse_str($queryString, $extraGet);
    $_GET = array_merge($_GET, $extraGet);
}

$route = trim($route, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Handle JSON Content-Type for all API routes except file download
if ($route !== 'zip/download' && $route !== 'api/zip/download') {
    header('Content-Type: application/json; charset=UTF-8');
}

try {
    switch ($route) {
        // Public Config
        case 'config/public':
        case 'api/config/public':
            echo json_encode([
                'success' => true,
                'razorpay_key_id' => RazorpayService::getKeyId(),
                'product_price_inr' => PaymentController::getActivePrice(),
                'product_name' => Config::get('PRODUCT_NAME', 'Custom Elementor & Site Builder Suite')
            ]);
            break;

        // Product Pricing
        case 'product/price':
        case 'api/product/price':
            PaymentController::getPrice();
            break;

        case 'admin/settings/price':
        case 'api/admin/settings/price':
            PaymentController::updatePrice();
            break;

        // Auth
        case 'auth/login':
        case 'api/auth/login':
            AuthController::login();
            break;

        case 'auth/me':
        case 'api/auth/me':
            AuthController::me();
            break;

        case 'auth/forgot-password':
        case 'api/auth/forgot-password':
            AuthController::forgotPassword();
            break;

        case 'auth/reset-password':
        case 'api/auth/reset-password':
            AuthController::resetPassword();
            break;

        // Public Payment & Purchase
        case 'payment/create-order':
        case 'api/payment/create-order':
            PaymentController::createOrder();
            break;

        case 'payment/verify-order':
        case 'api/payment/verify-order':
            PaymentController::verifyOrder();
            break;

        // Client Site Builder Telemetry & Lock Verification
        case 'license/verify':
        case 'api/license/verify':
            LicenseController::verify();
            break;

        // Admin License Management
        case 'admin/licenses':
        case 'api/admin/licenses':
            LicenseController::getAll();
            break;

        case 'admin/licenses/create':
        case 'api/admin/licenses/create':
            LicenseController::createManual();
            break;

        case 'admin/licenses/status':
        case 'api/admin/licenses/status':
            LicenseController::updateStatus();
            break;

        case 'admin/licenses/update':
        case 'api/admin/licenses/update':
            LicenseController::updateDetails();
            break;

        case 'admin/licenses/resend-email':
        case 'api/admin/licenses/resend-email':
            LicenseController::resendEmail();
            break;

        case 'admin/licenses/delete':
        case 'api/admin/licenses/delete':
            LicenseController::delete();
            break;

        // Admin Stats & Telemetry Logs
        case 'admin/stats':
        case 'api/admin/stats':
            StatsController::getStats();
            break;

        case 'admin/logs':
        case 'api/admin/logs':
            StatsController::getLogs();
            break;

        // Zip Management & Download
        case 'zip/download':
        case 'api/zip/download':
            ZipController::download();
            break;

        case 'zip/info':
        case 'api/zip/info':
            ZipController::getInfo();
            break;

        case 'admin/zip/upload':
        case 'api/admin/zip/upload':
            ZipController::upload();
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => "Endpoint not found: $route",
                'method' => $method
            ]);
            break;
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal Server Error: ' . $e->getMessage()
    ]);
}
