<?php
// server/controllers/PaymentController.php
require_once __DIR__ . '/../database/Database.php';
require_once __DIR__ . '/../core/RazorpayService.php';
require_once __DIR__ . '/../core/LicenseManager.php';
require_once __DIR__ . '/../core/EmailService.php';

class PaymentController {
    public static function getActivePrice(): float {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT value FROM settings WHERE key = 'product_price_inr' LIMIT 1");
            $stmt->execute();
            $val = $stmt->fetchColumn();
            if ($val !== false && $val !== null && is_numeric($val) && (float)$val > 0) {
                return (float)$val;
            }
        } catch (\Throwable $e) {}

        return (float)Config::get('PRODUCT_PRICE_INR', 499);
    }

    public static function getPrice(): void {
        $price = self::getActivePrice();
        echo json_encode([
            'success' => true,
            'price' => $price,
            'formatted' => '₹' . number_format($price)
        ]);
    }

    public static function updatePrice(): void {
        AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $price = (float)($data['price'] ?? 0);

        if ($price <= 0) {
            echo json_encode(['success' => false, 'error' => 'Please enter a valid price greater than 0']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO settings (key, value, updated_at) VALUES ('product_price_inr', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')");
        $stmt->execute([(string)$price]);

        echo json_encode([
            'success' => true,
            'price' => $price,
            'formatted' => '₹' . number_format($price),
            'message' => "Live price updated to ₹" . number_format($price) . " successfully!"
        ]);
    }

    public static function createOrder(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $amount = self::getActivePrice(); // Dynamically enforces admin-configured price
        $customerName = trim($data['name'] ?? '');
        $customerEmail = trim($data['email'] ?? '');
        $customerPhone = trim($data['phone'] ?? '');

        if (empty($customerEmail) || empty($customerName)) {
            echo json_encode(['success' => false, 'error' => 'Customer name and email are required']);
            return;
        }

        $receipt = 'rcpt_' . time() . '_' . substr(md5($customerEmail), 0, 6);
        $orderResult = RazorpayService::createOrder($amount, 'INR', $receipt);

        if (!$orderResult['success']) {
            echo json_encode($orderResult);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO orders (order_id, customer_name, customer_email, customer_phone, amount, currency, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([
            $orderResult['order']['id'],
            $customerName,
            $customerEmail,
            $customerPhone,
            $amount,
            'INR'
        ]);

        echo json_encode([
            'success' => true,
            'order_id' => $orderResult['order']['id'],
            'amount' => $orderResult['order']['amount'],
            'currency' => $orderResult['order']['currency'],
            'key_id' => $orderResult['key_id']
        ]);
    }

    public static function verifyOrder(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $orderId = trim($data['razorpay_order_id'] ?? '');
        $paymentId = trim($data['razorpay_payment_id'] ?? '');
        $signature = trim($data['razorpay_signature'] ?? '');
        $customerName = trim($data['customer_name'] ?? '');
        $customerEmail = trim($data['customer_email'] ?? '');
        $customerPhone = trim($data['customer_phone'] ?? '');

        if (empty($orderId) || empty($paymentId) || empty($signature)) {
            echo json_encode(['success' => false, 'error' => 'Missing payment verification data']);
            return;
        }

        // Verify Razorpay signature
        $isValid = RazorpayService::verifySignature($orderId, $paymentId, $signature);
        if (!$isValid) {
            echo json_encode(['success' => false, 'error' => 'Invalid payment signature']);
            return;
        }

        $pdo = Database::getConnection();

        // Check if order already processed
        $checkStmt = $pdo->prepare("SELECT * FROM orders WHERE order_id = ?");
        $checkStmt->execute([$orderId]);
        $existingOrder = $checkStmt->fetch();

        if ($existingOrder && $existingOrder['status'] === 'completed' && !empty($existingOrder['license_key'])) {
            echo json_encode([
                'success' => true,
                'message' => 'Order already completed',
                'license_key' => $existingOrder['license_key'],
                'download_url' => self::buildDownloadUrl($existingOrder['license_key'])
            ]);
            return;
        }

        if ($existingOrder) {
            $customerName = $customerName ?: $existingOrder['customer_name'];
            $customerEmail = $customerEmail ?: $existingOrder['customer_email'];
            $customerPhone = $customerPhone ?: $existingOrder['customer_phone'];
        }

        // 1. Generate unique 6-digit collision-free key
        $licenseKey = LicenseManager::generateUniqueKey($pdo);

        // 2. Insert into licenses table
        $licStmt = $pdo->prepare("
            INSERT INTO licenses (license_key, customer_name, customer_email, customer_phone, status, order_id)
            VALUES (?, ?, ?, ?, 'active', ?)
        ");
        $licStmt->execute([$licenseKey, $customerName, $customerEmail, $customerPhone, $orderId]);

        // 3. Update order status
        $updOrder = $pdo->prepare("
            UPDATE orders SET status = 'completed', payment_id = ?, license_key = ?
            WHERE order_id = ?
        ");
        $updOrder->execute([$paymentId, $licenseKey, $orderId]);

        // 4. Log telemetry activity
        LicenseManager::logActivity($pdo, $licenseKey, 'purchase', null, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', "Purchased via Razorpay: $paymentId");

        // 5. Send automated email with 6-digit key and download URL
        $downloadUrl = self::buildDownloadUrl($licenseKey);
        $emailResult = EmailService::sendLicenseEmail($customerEmail, $customerName, $licenseKey, $downloadUrl);

        if (!empty($emailResult['success'])) {
            LicenseManager::logActivity($pdo, $licenseKey, 'email_sent', null, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', "License & zip email sent to $customerEmail");
        } else {
            LicenseManager::logActivity($pdo, $licenseKey, 'email_failed', null, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', "Email delivery error to $customerEmail: " . json_encode($emailResult));
        }

        echo json_encode([
            'success' => true,
            'message' => 'Payment successful! License key and download link have been sent to your email.',
            'license_key' => $licenseKey,
            'download_url' => $downloadUrl,
            'email_sent' => $emailResult['success'] ?? false
        ]);
    }

    private static function buildDownloadUrl(string $licenseKey): string {
        $baseUrl = EmailService::getBaseUrl();
        return rtrim($baseUrl, '/') . '/server/index.php?route=zip/download&key=' . urlencode($licenseKey);
    }
}
