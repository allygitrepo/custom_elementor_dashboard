<?php
// server/controllers/ZipController.php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../database/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ZipController {
    public static function download(): void {
        $key = trim($_GET['key'] ?? '');
        $defaultZip = Config::get('DEFAULT_ZIP_NAME', 'Site_Builder_v2_29_09_26.zip');
        $zipDir = Config::getZipStorageDir();
        $zipPath = $zipDir . DIRECTORY_SEPARATOR . $defaultZip;

        // Also check if file exists in root or fallback
        if (!file_exists($zipPath)) {
            $rootZip = __DIR__ . '/../../' . $defaultZip;
            if (file_exists($rootZip)) {
                $zipPath = $rootZip;
            }
        }

        if (!file_exists($zipPath)) {
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

        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . basename($zipPath) . '"');
        header('Content-Length: ' . filesize($zipPath));
        header('Pragma: no-cache');
        header('Expires: 0');
        
        readfile($zipPath);
        exit;
    }

    public static function getInfo(): void {
        $defaultZip = Config::get('DEFAULT_ZIP_NAME', 'Site_Builder_v2_29_09_26.zip');
        $zipDir = Config::getZipStorageDir();
        $zipPath = $zipDir . DIRECTORY_SEPARATOR . $defaultZip;

        if (!file_exists($zipPath)) {
            $rootZip = __DIR__ . '/../../' . $defaultZip;
            if (file_exists($rootZip)) {
                $zipPath = $rootZip;
            }
        }

        if (file_exists($zipPath)) {
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

        $defaultZip = Config::get('DEFAULT_ZIP_NAME', 'Site_Builder_v2_29_09_26.zip');
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
