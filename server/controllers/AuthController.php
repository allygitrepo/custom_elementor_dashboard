<?php
// server/controllers/AuthController.php
require_once __DIR__ . '/../database/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../core/EmailService.php';

class AuthController {
    public static function login(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $email = trim($data['email'] ?? '');
        $password = (string)($data['password'] ?? '');

        if (empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'error' => 'Email and password are required']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
            return;
        }

        $token = AuthMiddleware::createToken([
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name']
        ]);

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name']
            ]
        ]);
    }

    public static function me(): void {
        $user = AuthMiddleware::authenticate();
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    }

    public static function forgotPassword(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $email = trim($data['email'] ?? '');

        if (empty($email)) {
            echo json_encode(['success' => false, 'error' => 'Email address is required']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            // For security, do not leak whether email exists, but return success message
            echo json_encode([
                'success' => true,
                'message' => 'If this email is registered, a password reset link has been sent.'
            ]);
            return;
        }

        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour

        $insertStmt = $pdo->prepare("
            INSERT INTO password_resets (email, token, expires_at)
            VALUES (?, ?, ?)
        ");
        $insertStmt->execute([$email, $token, $expiresAt]);

        // Build reset URL pointing to frontend reset password route
        $baseUrl = EmailService::getBaseUrl();
        $resetUrl = rtrim($baseUrl, '/') . '/#/admin/reset-password?token=' . $token;

        $mailResult = EmailService::sendPasswordResetEmail($email, $user['name'] ?? 'Admin', $resetUrl);

        echo json_encode([
            'success' => true,
            'message' => 'Password reset instructions have been sent to your email.',
            'mail_result' => $mailResult
        ]);
    }

    public static function resetPassword(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $token = trim($data['token'] ?? '');
        $newPassword = (string)($data['password'] ?? '');

        if (empty($token) || empty($newPassword)) {
            echo json_encode(['success' => false, 'error' => 'Token and new password are required']);
            return;
        }

        if (strlen($newPassword) < 6) {
            echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT * FROM password_resets 
            WHERE token = ? AND used = 0 AND expires_at > datetime('now')
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([$token]);
        $reset = $stmt->fetch();

        if (!$reset) {
            echo json_encode(['success' => false, 'error' => 'Reset link is invalid or has expired']);
            return;
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $updateUser = $pdo->prepare("UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE email = ?");
        $updateUser->execute([$newHash, $reset['email']]);

        $markUsed = $pdo->prepare("UPDATE password_resets SET used = 1 WHERE id = ?");
        $markUsed->execute([$reset['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'Password has been successfully updated! You can now log in.'
        ]);
    }
}
