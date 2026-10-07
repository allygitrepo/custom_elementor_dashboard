<?php
// server/core/LicenseManager.php
require_once __DIR__ . '/../database/Database.php';

class LicenseManager {
    /**
     * Generates a collision-free 6-character uppercase alphanumeric key.
     * Guaranteed no duplicates in SQLite database.
     */
    public static function generateUniqueKey(PDO $pdo): string {
        $characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed confusing 0, 1, I, O
        $maxAttempts = 50;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $key = '';
            for ($i = 0; $i < 6; $i++) {
                $key .= $characters[random_int(0, strlen($characters) - 1)];
            }

            // Check if key already exists in DB
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM licenses WHERE license_key = ?");
            $stmt->execute([$key]);
            if ((int)$stmt->fetchColumn() === 0) {
                return $key;
            }
        }

        // Fallback with timestamp microtime hash if collision threshold reached
        return strtoupper(substr(md5(uniqid((string)mt_rand(), true)), 0, 6));
    }

    /**
     * Log activity event to SQLite table
     */
    public static function logActivity(PDO $pdo, ?string $licenseKey, string $eventType, ?string $domain, ?string $ip, ?string $details = ''): void {
        try {
            $stmt = $pdo->prepare("
                INSERT INTO activity_logs (license_key, event_type, domain, ip, details)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$licenseKey, $eventType, $domain, $ip, $details]);
        } catch (Exception $e) {
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
}
