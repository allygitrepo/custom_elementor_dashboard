<?php
// server/controllers/ZipController.php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../database/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ZipController {
    public static function resolveZipPath(): ?string {
        $defaultZip = Config::get('DEFAULT_ZIP_NAME', 'site_builder.zip');
        $zipDir = Config::getZipStorageDir();

        // 1. Try default configured path
        $configuredPath = $zipDir . DIRECTORY_SEPARATOR . $defaultZip;
        if (file_exists($configuredPath)) {
            return $configuredPath;
        }

        // 2. Try site_builder.zip specifically
        $siteBuilderPath = $zipDir . DIRECTORY_SEPARATOR . 'site_builder.zip';
        if (file_exists($siteBuilderPath)) {
            return $siteBuilderPath;
        }

        // 3. Scan zip directory for any available .zip archive
        if (is_dir($zipDir)) {
            $files = glob($zipDir . DIRECTORY_SEPARATOR . '*.zip');
            if (!empty($files)) {
                // Return the newest modified zip file
                usort($files, fn($a, $b) => filemtime($b) - filemtime($a));
                return $files[0];
            }
        }

        // 4. Check root directory fallbacks
        $rootZip = __DIR__ . '/../../' . $defaultZip;
        if (file_exists($rootZip)) {
            return $rootZip;
        }
        $rootDefault = __DIR__ . '/../../site_builder.zip';
        if (file_exists($rootDefault)) {
            return $rootDefault;
        }

        return null;
    }

    public static function getActiveHubUrl(): string {
        $isHttps = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
            || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
            || (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_SSL']) === 'on')
            || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);

        $protocol = $isHttps ? "https://" : "http://";
        $host = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? ($_SERVER['HTTP_HOST'] ?? 'localhost');
        
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '/server/index.php';
        $scriptName = str_replace('\\', '/', $scriptName);
        
        if (!str_starts_with($scriptName, '/')) {
            $scriptName = '/' . $scriptName;
        }

        if (str_contains($scriptName, '/server/')) {
            $serverPath = preg_replace('#/server/.*$#', '/server/index.php', $scriptName);
        } else {
            $scriptDir = dirname($scriptName);
            $serverPath = rtrim($scriptDir, '/') . '/server/index.php';
        }

        return $protocol . $host . $serverPath;
    }

    public static function download(): void {
        $key = trim($_GET['key'] ?? '');
        $zipPath = self::resolveZipPath();

        if (!$zipPath || !file_exists($zipPath)) {
            http_response_code(404);
            echo "Zip package file not found on server.";
            return;
        }

        // Optional license check if key is provided
        if (!empty($key)) {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT status FROM licenses WHERE license_key = ?");
            $stmt->execute([$key]);
            $status = $stmt->fetchColumn();

            if ($status && $status === 'revoked') {
                http_response_code(403);
                echo "This license key is revoked. Download denied.";
                return;
            }
        }

        // Clean any preceding output buffers to prevent corrupt files or aborts
        while (ob_get_level()) {
            ob_end_clean();
        }

        $activeHubUrl = self::getActiveHubUrl();
        $streamFile = $zipPath;
        $isTempFile = false;

        // If ZipArchive is available (standard in live PHP/Apache), dynamically inject active live Hub URL on the fly
        if (class_exists('ZipArchive')) {
            $tmpDir = sys_get_temp_dir();
            $tmpZip = $tmpDir . DIRECTORY_SEPARATOR . 'sb_dl_' . uniqid() . '.zip';
            if (@copy($zipPath, $tmpZip)) {
                $zip = new ZipArchive();
                if ($zip->open($tmpZip) === true) {
                    $lockContent = $zip->getFromName('server/core/LicenseLock.php');
                    if ($lockContent !== false) {
                        $updatedContent = preg_replace(
                            "/public const HUB_URL = '[^']*';/",
                            "public const HUB_URL = '" . addslashes($activeHubUrl) . "';",
                            $lockContent
                        );
                        $zip->addFromString('server/core/LicenseLock.php', $updatedContent);
                    }
                    $zip->close();
                    $streamFile = $tmpZip;
                    $isTempFile = true;
                }
            }
        }

        $filename = basename($zipPath);
        $fileSize = filesize($streamFile);

        header('Content-Description: File Transfer');
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0, private');
        header('Pragma: public');
        header('Content-Length: ' . $fileSize);
        header('Accept-Ranges: bytes');
        
        // Use binary chunk stream for rock-solid large file transfer
        $handle = fopen($streamFile, 'rb');
        if ($handle !== false) {
            while (!feof($handle)) {
                echo fread($handle, 65536); // 64KB buffer
                flush();
            }
            fclose($handle);
        } else {
            readfile($streamFile);
        }

        if ($isTempFile && file_exists($streamFile)) {
            @unlink($streamFile);
        }
        exit;
    }

    public static function getInfo(): void {
        $zipPath = self::resolveZipPath();
        $defaultZip = Config::get('DEFAULT_ZIP_NAME', 'site_builder.zip');

        if ($zipPath && file_exists($zipPath)) {
            echo json_encode([
                'success' => true,
                'exists' => true,
                'filename' => basename($zipPath),
                'size_bytes' => filesize($zipPath),
                'size_formatted' => round(filesize($zipPath) / (1024 * 1024), 2) . ' MB',
                'updated_at' => date('Y-m-d H:i:s', filemtime($zipPath))
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'exists' => false,
                'filename' => $defaultZip,
                'size_bytes' => 0
            ]);
        }
    }

    public static function upload(): void {
        AuthMiddleware::authenticate();

        if (empty($_FILES['zip_file']) || $_FILES['zip_file']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'error' => 'No zip file uploaded or upload error']);
            return;
        }

        $file = $_FILES['zip_file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if ($ext !== 'zip') {
            echo json_encode(['success' => false, 'error' => 'Only .zip files are allowed']);
            return;
        }

        $defaultZip = Config::get('DEFAULT_ZIP_NAME', 'site_builder.zip');
        $zipDir = Config::getZipStorageDir();
        $targetPath = $zipDir . DIRECTORY_SEPARATOR . $defaultZip;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            echo json_encode([
                'success' => true,
                'message' => 'Zip package updated successfully',
                'filename' => $defaultZip,
                'size_formatted' => round(filesize($targetPath) / (1024 * 1024), 2) . ' MB'
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
        }
    }
}
