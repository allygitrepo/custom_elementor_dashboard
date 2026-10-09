<?php
// server/core/RazorpayService.php
require_once __DIR__ . '/../config/config.php';

class RazorpayService {
    public static function getKeyId(): string {
        return Config::get('RAZORPAY_KEY_ID', 'rzp_test_SgRf2CKVk35fBy');
    }

    public static function getKeySecret(): string {
        return Config::get('RAZORPAY_KEY_SECRET', 'rq7MWyAp6BVEorzrCpzw1oCn');
    }

    public static function createOrder(float $amount, string $currency = 'INR', string $receipt = ''): array {
        $keyId = self::getKeyId();
        $keySecret = self::getKeySecret();

        $url = 'https://api.razorpay.com/v1/orders';
        $amountInSubunits = (int)round($amount * 100);

        $payload = [
            'amount' => $amountInSubunits,
            'currency' => $currency,
            'receipt' => $receipt ?: 'rcpt_' . time() . '_' . mt_rand(100, 999),
            'payment_capture' => 1
        ];

        $response = false;
        $httpCode = 0;
        $errorMessage = '';

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_USERPWD, $keyId . ':' . $keySecret);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $errorMessage = $curlError;
            }
        }

        if (!$response) {
            $auth = base64_encode($keyId . ':' . $keySecret);
            $options = [
                'http' => [
                    'method' => 'POST',
                    'header' => [
                        "Authorization: Basic $auth",
                        "Content-Type: application/json",
                        "Accept: application/json"
                    ],
                    'content' => json_encode($payload),
                    'timeout' => 15,
                    'ignore_errors' => true
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false
                ]
            ];
            $context = stream_context_create($options);
            $response = @file_get_contents($url, false, $context);
            if (isset($http_response_header) && !empty($http_response_header)) {
                if (preg_match('#HTTP/\S+\s+(\d+)#', $http_response_header[0], $matches)) {
                    $httpCode = (int)$matches[1];
                }
            }
        }

        if (!$response) {
            return ['success' => false, 'error' => $errorMessage ?: 'Unable to connect to Razorpay server'];
        }

        $data = json_decode($response, true);
        if ($httpCode >= 200 && $httpCode < 300 && isset($data['id'])) {
            return ['success' => true, 'order' => $data, 'key_id' => $keyId, 'amount' => $amountInSubunits, 'currency' => $currency];
        }

        return ['success' => false, 'error' => $data['error']['description'] ?? 'Razorpay order creation failed'];
    }

    public static function verifySignature(string $orderId, string $paymentId, string $signature): bool {
        $keySecret = self::getKeySecret();
        $expectedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $keySecret);
        return hash_equals($expectedSignature, $signature);
    }
}
