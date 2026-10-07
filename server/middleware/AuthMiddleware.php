<?php
// server/middleware/AuthMiddleware.php
require_once __DIR__ . '/../database/Database.php';

class AuthMiddleware {
    public static function authenticate(): array {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] 
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
            ?? $_SERVER['Authorization'] 
            ?? '';

        if (empty($authHeader) && function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (empty($authHeader) && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            self::unauthorized('Missing or invalid Authorization header');
        }

        $token = trim($matches[1]);
        $payload = self::verifyToken($token);

        if (!$payload) {
            self::unauthorized('Invalid or expired token');
        }

        return $payload;
    }

    public static function createToken(array $userData): string {
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payloadData = array_merge($userData, [
            'iat' => time(),
            'exp' => time() + (86400 * 7) // 7 days
        ]);
        $payload = base64_encode(json_encode($payloadData));
        $secret = Config::get('APP_SECRET', 'elem_sec_key_77a9b2aad_e665_422c');
        $signature = hash_hmac('sha256', "$header.$payload", $secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return "$header.$payload.$base64UrlSignature";
    }

    public static function verifyToken(string $jwt): ?array {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;
        $secret = Config::get('APP_SECRET', 'elem_sec_key_77a9b2aad_e665_422c');
        $expectedSignature = hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true);
        $expectedB64 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));

        if (!hash_equals($expectedB64, $signatureB64)) {
            return null;
        }

        $payload = json_decode(base64_decode($payloadB64), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    private static function unauthorized(string $message): void {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => $message]);
        exit;
    }
}
