<?php
// server/database/Schema.php

class Schema {
    public static function initialize(PDO $pdo): void {
        // 1. Admin Users Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT DEFAULT 'Admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        // 2. Licenses Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS licenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                license_key TEXT UNIQUE NOT NULL,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                customer_phone TEXT,
                status TEXT DEFAULT 'active', -- active, suspended, revoked, pending
                deployed_domain TEXT DEFAULT NULL,
                deployed_ip TEXT DEFAULT NULL,
                deployed_url TEXT DEFAULT NULL,
                activation_date DATETIME DEFAULT NULL,
                last_ping_date DATETIME DEFAULT NULL,
                ping_count INTEGER DEFAULT 0,
                max_activations INTEGER DEFAULT 1,
                order_id TEXT DEFAULT NULL,
                payment_id TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT DEFAULT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
            CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(customer_email);
            CREATE INDEX IF NOT EXISTS idx_licenses_domain ON licenses(deployed_domain);
        ");

        try {
            $pdo->exec("ALTER TABLE licenses ADD COLUMN payment_id TEXT DEFAULT NULL;");
        } catch (\Throwable $e) {}

        // 3. Password Resets Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                used INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
        ");

        // 4. Orders & Payments Table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT UNIQUE NOT NULL, -- Razorpay order_id or custom
                payment_id TEXT DEFAULT NULL, -- Razorpay payment_id
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                customer_phone TEXT DEFAULT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'INR',
                status TEXT DEFAULT 'pending', -- pending, completed, failed
                license_key TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        // 5. Activity & Telemetry Logs
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                license_key TEXT DEFAULT NULL,
                event_type TEXT NOT NULL, -- purchase, activation_success, activation_failed, domain_bound, ping, revoked
                domain TEXT DEFAULT NULL,
                ip TEXT DEFAULT NULL,
                details TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_activity_logs_key ON activity_logs(license_key);
        ");

        // 6. Settings / Key-Value table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ");

        // Seed default admin user: vatsalparmar1742002@gmail.com / 123456
        $checkStmt = $pdo->prepare("SELECT id FROM admin_users WHERE email = ?");
        $checkStmt->execute(['vatsalparmar1742002@gmail.com']);
        if (!$checkStmt->fetch()) {
            $defaultHash = password_hash('123456', PASSWORD_BCRYPT);
            $insertStmt = $pdo->prepare("INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)");
            $insertStmt->execute(['vatsalparmar1742002@gmail.com', $defaultHash, 'Vatsal Parmar']);
        }
    }

    public static function migrate(PDO $pdo): void {
        try {
            $cols = $pdo->query("PRAGMA table_info(licenses)")->fetchAll(PDO::FETCH_ASSOC);
            $colNames = array_column($cols, 'name');
            if (!in_array('payment_id', $colNames)) {
                $pdo->exec("ALTER TABLE licenses ADD COLUMN payment_id TEXT DEFAULT NULL;");
            }
        } catch (\Throwable $e) {
            // Ignore migration error if column exists or fails gracefully
        }
    }
}

