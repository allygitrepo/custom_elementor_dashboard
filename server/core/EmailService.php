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
            'subject' => $subject,
            'Subject' => $subject,
            'html' => $htmlContent,
            'Html' => $htmlContent,
            'body' => $htmlContent,
            'Body' => $htmlContent,
            'message' => $htmlContent,
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

        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $currentUri = $_SERVER['REQUEST_URI'] ?? '/';
        $baseFolder = explode('/server', $currentUri)[0];
        return rtrim($protocol . $host . $baseFolder, '/');
    }

    public static function sendLicenseEmail(string $customerEmail, string $customerName, string $licenseKey, string $downloadUrl): array {
        $subject = "🎉 Your Custom Elementor Site Builder License & Download Key: $licenseKey";
        $productName = Config::get('PRODUCT_NAME', 'Custom Elementor & Site Builder Suite');

        $html = '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 10px; font-family: -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); background-color: #6366f1; padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Purchase Confirmed!</h1>
                    <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 14px;">Thank you for purchasing ' . htmlspecialchars($productName) . '</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px 24px; color: #e2e8f0;">
                    <p style="font-size: 16px; color: #f8fafc; margin: 0 0 12px;">Hello <strong>' . htmlspecialchars($customerName) . '</strong>,</p>
                    <p style="color: #94a3b8; line-height: 1.6; margin: 0 0 24px;">Your unique activation key and builder package are ready. Use this 6-digit key to activate the builder on your localhost or live domain.</p>
                    
                    <div style="background-color: #0f172a; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                      <div style="font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; font-weight: 700;">Your Unique 6-Digit License Key</div>
                      <div style="font-size: 38px; font-weight: 800; color: #38bdf8; letter-spacing: 6px; margin: 10px 0; font-family: monospace;">' . htmlspecialchars($licenseKey) . '</div>
                      <div style="font-size: 12px; color: #64748b;">Keep this key safe. It will be required during activation.</div>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="' . htmlspecialchars($downloadUrl) . '" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 15px 32px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px rgba(99,102,241,0.4);" target="_blank">⬇️ Download Site Builder Zip</a>
                    </div>

                    <div style="background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 14px 18px; margin: 20px 0; text-align: left;">
                      <div style="font-size: 13px; font-weight: 700; color: #fbbf24; margin-bottom: 4px;">⚠️ Activation Policy Notice:</div>
                      <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">You can download the zip package <strong>multiple times</strong> from the button above, but your 6-digit access key can only be activated <strong>one time</strong> (it will be locked to your first target domain/localhost upon activation).</div>
                    </div>

                    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px 20px; margin: 24px 0; border: 1px solid #334155;">
                      <div style="font-weight: 700; color: #f1f5f9; margin-bottom: 8px; font-size: 14px;">Quick Activation Steps:</div>
                      <ol style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.8;">
                        <li>Deploy the zip package onto your server or localhost.</li>
                        <li>Open the builder URL in your browser.</li>
                        <li>Enter your 6-digit key: <strong style="color: #38bdf8;">' . htmlspecialchars($licenseKey) . '</strong> on the activation screen.</li>
                        <li>The system will bind your domain and unlock the full site builder suite!</li>
                      </ol>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #334155; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; background-color: #111726;">
                    &copy; ' . date('Y') . ' Custom Elementor & Site Builder Platform. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>';

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
