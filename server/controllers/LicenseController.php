<?php
// server/controllers/LicenseController.php
require_once __DIR__ . '/../database/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../core/LicenseManager.php';
require_once __DIR__ . '/../core/EmailService.php';

class LicenseController {
    private static function normalizeDomain(string $domain): string {
        $domain = trim($domain);
        $domain = preg_replace('#^https?://#i', '', $domain);
        if (strpos($domain, '/') !== false) {
            $domain = explode('/', $domain)[0];
        }
        if (strpos($domain, ':') !== false) {
            $domain = explode(':', $domain)[0];
        }
        return strtolower(trim($domain));
    }

    /**
     * Public API endpoint called by client Site Builder instances upon launch / verification
     */
    public static function verify(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $key = strtoupper(trim($data['license_key'] ?? ''));
        $rawDomain = trim($data['domain'] ?? ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
        $domain = self::normalizeDomain($rawDomain);
        if (empty($domain)) {
            $domain = 'localhost';
        }
        $url = trim($data['url'] ?? '');
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

        if (empty($key)) {
            echo json_encode(['valid' => false, 'error' => 'License access key is required']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM licenses WHERE license_key = ?");
        $stmt->execute([$key]);
        $license = $stmt->fetch();

        if (!$license) {
            LicenseManager::logActivity($pdo, $key, 'activation_failed', $domain, $ip, 'Key not found in database');
            echo json_encode([
                'valid' => false,
                'error' => 'Invalid 6-digit access key. Please check your purchase email.'
            ]);
            return;
        }

        if ($license['status'] === 'revoked') {
            LicenseManager::logActivity($pdo, $key, 'activation_failed', $domain, $ip, 'Revoked license verification attempt');
            echo json_encode([
                'valid' => false,
                'status' => 'revoked',
                'error' => 'This access key has been revoked.'
            ]);
            return;
        }

        if ($license['status'] === 'suspended') {
            LicenseManager::logActivity($pdo, $key, 'activation_failed', $domain, $ip, 'Suspended license verification attempt');
            echo json_encode([
                'valid' => false,
                'status' => 'suspended',
                'error' => 'This access key is currently suspended. Please contact support.'
            ]);
            return;
        }

        // Domain binding & Single-Domain lock enforcement
        $existingDomain = !empty($license['deployed_domain']) ? self::normalizeDomain($license['deployed_domain']) : '';

        if (empty($existingDomain)) {
            // First time activation: bind domain permanently
            $updateStmt = $pdo->prepare("
                UPDATE licenses 
                SET deployed_domain = ?, deployed_ip = ?, deployed_url = ?, 
                    activation_date = datetime('now'), last_ping_date = datetime('now'),
                    ping_count = 1
                WHERE id = ?
            ");
            $updateStmt->execute([$domain, $ip, $url, $license['id']]);
            $existingDomain = $domain;

            LicenseManager::logActivity($pdo, $key, 'domain_bound', $domain, $ip, "Permanently bound to domain: $domain");
        } else {
            // Check if domain matches the bound domain (Strict Single-Use Policy)
            if ($existingDomain !== $domain) {
                LicenseManager::logActivity($pdo, $key, 'activation_rejected', $domain, $ip, "Attempted to use key on '$domain', but key is already locked to '$existingDomain'");
                echo json_encode([
                    'valid' => false,
                    'error' => "This 6-digit access key has already been used on domain: '{$existingDomain}'. It cannot be used on another domain ('{$domain}')."
                ]);
                return;
            }

            // Same domain: heartbeat ping
            $updateStmt = $pdo->prepare("
                UPDATE licenses 
                SET last_ping_date = datetime('now'), ping_count = ping_count + 1, deployed_ip = ?
                WHERE id = ?
            ");
            $updateStmt->execute([$ip, $license['id']]);

            LicenseManager::logActivity($pdo, $key, 'ping', $domain, $ip, "Heartbeat ping from $domain");
        }

        // Generate client activation token / hash
        $secret = Config::get('APP_SECRET', 'elem_sec_key_77a9b2aad_e665_422c');
        $activationToken = hash_hmac('sha256', $key . '|' . $domain, $secret);

        echo json_encode([
            'valid' => true,
            'license_key' => $key,
            'customer_name' => $license['customer_name'],
            'status' => $license['status'],
            'deployed_domain' => $domain,
            'activation_token' => $activationToken,
            'message' => 'License successfully verified and unlocked!'
        ]);
    }

    /**
     * Admin: Get all licenses with pagination & search
     */
    public static function getAll(): void {
        AuthMiddleware::authenticate();

        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 25)));
        $offset = ($page - 1) * $limit;

        $pdo = Database::getConnection();
        $where = [];
        $params = [];

        if (!empty($search)) {
            $where[] = "(license_key LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR deployed_domain LIKE ?)";
            $searchTerm = "%$search%";
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }

        if (!empty($status)) {
            $where[] = "status = ?";
            $params[] = $status;
        }

        $whereSql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        // Total count
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM licenses $whereSql");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        // Fetch list
        $sql = "SELECT * FROM licenses $whereSql ORDER BY id DESC LIMIT $limit OFFSET $offset";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $licenses = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $licenses,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * Admin: Create manual license key
     */
    public static function createManual(): void {
        AuthMiddleware::authenticate();

        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $name = trim($data['customer_name'] ?? '');
        $email = trim($data['customer_email'] ?? '');
        $phone = trim($data['customer_phone'] ?? '');
        $notes = trim($data['notes'] ?? '');
        $sendEmail = !empty($data['send_email']);

        if (empty($name) || empty($email)) {
            echo json_encode(['success' => false, 'error' => 'Customer name and email are required']);
            return;
        }

        $pdo = Database::getConnection();
        $licenseKey = LicenseManager::generateUniqueKey($pdo);

        $stmt = $pdo->prepare("
            INSERT INTO licenses (license_key, customer_name, customer_email, customer_phone, status, notes)
            VALUES (?, ?, ?, ?, 'active', ?)
        ");
        $stmt->execute([$licenseKey, $name, $email, $phone, $notes]);

        LicenseManager::logActivity($pdo, $licenseKey, 'manual_create', null, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', "Created manually by admin");

        $emailSent = false;
        if ($sendEmail) {
            $baseUrl = EmailService::getBaseUrl();
            $downloadUrl = rtrim($baseUrl, '/') . '/server/index.php?route=zip/download&key=' . urlencode($licenseKey);

            $mailRes = EmailService::sendLicenseEmail($email, $name, $licenseKey, $downloadUrl);
            $emailSent = $mailRes['success'] ?? false;
        }

        echo json_encode([
            'success' => true,
            'message' => 'License key generated successfully',
            'license_key' => $licenseKey,
            'email_sent' => $emailSent
        ]);
    }

    /**
     * Admin: Update license status (active, suspended, revoked)
     */
    public static function updateStatus(): void {
        AuthMiddleware::authenticate();

        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = (int)($data['id'] ?? 0);
        $status = trim($data['status'] ?? '');

        if (!in_array($status, ['active', 'suspended', 'revoked'])) {
            echo json_encode(['success' => false, 'error' => 'Invalid status']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE licenses SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        echo json_encode([
            'success' => true,
            'message' => "License status updated to $status"
        ]);
    }

    /**
     * Admin: Resend License Email to Customer
     */
    public static function resendEmail(): void {
        AuthMiddleware::authenticate();

        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = (int)($data['id'] ?? 0);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM licenses WHERE id = ?");
        $stmt->execute([$id]);
        $license = $stmt->fetch();

        if (!$license) {
            echo json_encode(['success' => false, 'error' => 'License not found']);
            return;
        }

        $baseUrl = EmailService::getBaseUrl();
        $downloadUrl = rtrim($baseUrl, '/') . '/server/index.php?route=zip/download&key=' . urlencode($license['license_key']);

        $result = EmailService::sendLicenseEmail(
            $license['customer_email'],
            $license['customer_name'],
            $license['license_key'],
            $downloadUrl
        );

        echo json_encode([
            'success' => $result['success'] ?? false,
            'message' => ($result['success'] ?? false) ? 'Email resent successfully!' : 'Failed to send email',
            'details' => $result
        ]);
    }

    /**
     * Admin: Delete license
     */
    public static function delete(): void {
        AuthMiddleware::authenticate();

        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = (int)($data['id'] ?? 0);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM licenses WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'License deleted successfully']);
    }
}
