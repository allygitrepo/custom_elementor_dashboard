<?php
// server/database/Database.php
require_once __DIR__ . '/../config/config.php';

class Database {
    private static ?PDO $pdo = null;

    public static function getConnection(): PDO {
        if (self::$pdo === null) {
            $dbFile = Config::getDbPath();
            $isNew = !file_exists($dbFile) || filesize($dbFile) === 0;

            try {
                self::$pdo = new PDO("sqlite:" . $dbFile);
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                
                // Enable foreign keys and WAL mode for high performance SQLite
                self::$pdo->exec("PRAGMA foreign_keys = ON;");
                self::$pdo->exec("PRAGMA journal_mode = WAL;");

                require_once __DIR__ . '/Schema.php';
                if ($isNew) {
                    Schema::initialize(self::$pdo);
                } else {
                    Schema::migrate(self::$pdo);
                }
            } catch (PDOException $e) {
                die(json_encode([
                    'success' => false,
                    'error' => 'Database connection failed: ' . $e->getMessage()
                ]));
            }
        }

        return self::$pdo;
    }
}
