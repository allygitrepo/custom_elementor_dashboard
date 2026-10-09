<?php
// server/core/EmailService.php
require_once __DIR__ . '/../config/config.php';

class EmailService {
    public static function send(string $toEmail, string $subject, string $htmlContent, string $toName = ''): array {
        $apiUrl = Config::get('EMAIL_SERVICE_URL', 'https://silverapi.allysoftsolutions.com/email/email-service');
        $senderEmail = Config::get('EMAIL_SERVICE_EMAIL', 'test.allysoftsolutions@gmail.com');
        $passkey = Config::get('EMAIL_SERVICE_PASSKEY', 'sowm fxar lzhf endf');
        $timeout = (int)Config::get('EMAIL_SERVICE_TIMEOUT', 15);
        $verifyPeer = filter_var(Config::get('EMAIL_SERVICE_VERIFY_PEER', false), FILTER_VALIDATE_BOOLEAN);

        $payload = [
            'to' => $toEmail,
            'To' => $toEmail,
            'recipient' => $toEmail,
            'to_name' => $toName ?: $toEmail,
            'from_name' => 'ElementorBuilder Pro',
            'sender_name' => 'ElementorBuilder Pro',
            'subject' => $subject,
            'Subject' => $subject,
            'html' => $htmlContent,
            'Html' => $htmlContent,
            'body' => $htmlContent,
            'Body' => $htmlContent,
            'message' => $htmlContent,
            'text' => strip_tags(str_replace(['<br>', '<br/>', '</p>', '</div>', '</li>'], "\n", $htmlContent)),
            'is_html' => true,
            'isHtml' => true
        ];

        $postData = json_encode($payload);

        $headersArray = [
            'Content-Type: application/json',
            'Accept: application/json',
            'email: ' . $senderEmail,
            'passkey: ' . $passkey
        ];

        // Prefer cURL if available
        if (function_exists('curl_init')) {
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headersArray);
            curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $verifyPeer);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $verifyPeer ? 2 : 0);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                error_log("EmailService cURL Error: " . $curlError);
                return ['success' => false, 'error' => $curlError];
            }

            $decoded = json_decode($response, true);
            return [
                'success' => $httpCode >= 200 && $httpCode < 300,
                'status_code' => $httpCode,
                'response' => $decoded ?: $response
            ];
        } else {
            // Stream context fallback
            $headerStr = implode("\r\n", $headersArray) . "\r\n";
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => $headerStr,
                    'content' => $postData,
                    'timeout' => $timeout,
                    'ignore_errors' => true
                ],
                'ssl' => [
                    'verify_peer' => $verifyPeer,
                    'verify_peer_name' => $verifyPeer
                ]
            ]);

            $response = @file_get_contents($apiUrl, false, $context);
            if ($response === false) {
                return ['success' => false, 'error' => 'HTTP request failed via stream context'];
            }

            $decoded = json_decode($response, true);
            $isSuccess = isset($decoded['success']) ? (bool)$decoded['success'] : (!isset($decoded['error']));

            return [
                'success' => $isSuccess,
                'response' => $decoded ?: $response
            ];
        }
    }

    public static function getBaseUrl(): string {
        $appUrl = Config::get('APP_URL');
        if (!empty($appUrl)) {
            return rtrim($appUrl, '/');
        }

        $isHttps = false;
        if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') {
            $isHttps = true;
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
            $isHttps = true;
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_SSL']) === 'on') {
            $isHttps = true;
        } elseif (!empty($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) {
            $isHttps = true;
        }

        $protocol = $isHttps ? "https://" : "http://";
        $host = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? ($_SERVER['HTTP_HOST'] ?? 'localhost');
        if (str_contains($host, ',')) {
            $host = trim(explode(',', $host)[0]);
        }

        // Accurately determine the web root subfolder
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $baseFolder = '';
        if (str_contains($scriptName, '/server')) {
            $baseFolder = explode('/server', $scriptName)[0];
        } else {
            $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
            $baseFolder = explode('/server', $requestUri)[0];
        }

        $baseFolder = '/' . trim($baseFolder, '/');
        if ($baseFolder === '/') {
            $baseFolder = '';
        }

        return rtrim($protocol . $host . $baseFolder, '/');
    }

    public static function sendLicenseEmail(string $customerEmail, string $customerName, string $licenseKey, string $downloadUrl): array {
        $subject = "WebCraft Studio - Order Confirmation & License Key [Key: $licenseKey]";
        $productName = Config::get('PRODUCT_NAME', 'WebCraft Studio');
        $baseUrl = self::getBaseUrl();
        $portalUrl = rtrim($baseUrl, '/') . '/#/download?key=' . urlencode($licenseKey);

        $html = '<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>' . htmlspecialchars($subject) . '</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 15px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 24px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">Order Confirmation</h1>
                      <p style="margin: 6px 0 0; color: #e0e7ff; font-size: 14px;">Thank you for your purchase of ' . htmlspecialchars($productName) . '</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px 28px; color: #334155;">
                      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px; font-weight: 600;">Dear ' . htmlspecialchars($customerName) . ',</p>
                      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">Your order has been completed successfully. Your standalone site builder package and activation key are ready for immediate use.</p>
                      
                      <!-- 6-Digit Key Box -->
                      <div style="background-color: #f8fafc; border: 2px dashed #6366f1; border-radius: 10px; padding: 22px 16px; text-align: center; margin: 24px 0;">
                        <div style="font-size: 11px; text-transform: uppercase; color: #6366f1; letter-spacing: 1px; font-weight: 700;">YOUR 6-DIGIT ACTIVATION KEY</div>
                        <div style="font-size: 36px; font-weight: 800; color: #0f172a; letter-spacing: 6px; margin: 10px 0; font-family: Consolas, Monaco, monospace;">' . htmlspecialchars($licenseKey) . '</div>
                        <div style="font-size: 12px; color: #64748b;">Save this key. You will need it to activate the builder on your domain.</div>
                      </div>

                      <!-- Primary Portal Action Button -->
                      <div style="text-align: center; margin: 30px 0 20px;">
                        <a href="' . htmlspecialchars($portalUrl) . '" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);" target="_blank">Access License & Download Portal &rarr;</a>
                      </div>

                      <div style="text-align: center; font-size: 12px; color: #64748b; margin-bottom: 24px;">
                        Direct ZIP mirror: <a href="' . htmlspecialchars($downloadUrl) . '" style="color: #4f46e5; text-decoration: underline;">Download ZIP directly</a>
                      </div>

                      <!-- Quick Guide -->
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px 20px; border: 1px solid #e2e8f0; font-size: 13px; color: #475569;">
                        <div style="font-weight: 700; color: #1e293b; margin-bottom: 8px;">Quick Setup Guide:</div>
                        <ol style="margin: 0; padding-left: 18px; line-height: 1.7;">
                          <li>Extract the downloaded ZIP package to your local or live server.</li>
                          <li>Open the builder URL in your web browser.</li>
                          <li>Enter your 6-digit key: <strong style="color: #4f46e5;">' . htmlspecialchars($licenseKey) . '</strong> to activate.</li>
                        </ol>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f8fafc;">
                      &copy; ' . date('Y') . ' ' . htmlspecialchars($productName) . ' &bull; Developed by AllySoft Solutions
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>';

        return self::send($customerEmail, $subject, $html, $customerName);
    }

    public static function sendPasswordResetEmail(string $adminEmail, string $adminName, string $resetUrl): array {
        $subject = "🔒 Password Reset Request - Custom Elementor Admin";

        $html = '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 10px; font-family: -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 550px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
                <tr>
                  <td style="background-color: #3b82f6; padding: 28px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">Password Reset Request</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px 24px; color: #e2e8f0;">
                    <p style="color: #f8fafc; font-size: 15px; margin: 0 0 12px;">Hello <strong>' . htmlspecialchars($adminName) . '</strong>,</p>
                    <p style="color: #94a3b8; line-height: 1.6; margin: 0 0 24px;">We received a request to reset your password for the Custom Elementor Admin Portal. Click the button below to set a new password.</p>
                    
                    <div style="text-align: center; margin: 28px 0;">
                      <a href="' . htmlspecialchars($resetUrl) . '" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 700; font-size: 15px;" target="_blank">Reset My Password</a>
                    </div>

                    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 20px 0 10px;">This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
                    <p style="font-size: 12px; color: #475569; word-break: break-all; margin: 0;">Direct link: <a href="' . htmlspecialchars($resetUrl) . '" style="color: #38bdf8;">' . htmlspecialchars($resetUrl) . '</a></p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #334155; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; background-color: #111726;">
                    Custom Elementor Admin Portal Security
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>';

        return self::send($adminEmail, $subject, $html, $adminName);
    }
}
