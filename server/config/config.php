<?php
// server/config/config.php

class Config {
    private static array $env = [];

    public static function loadEnv(string $path = __DIR__ . '/../.env'): void {
        if (!file_exists($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }

            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                self::$env[$key] = $value;
                putenv("$key=$value");
                $_ENV[$key] = $value;
            }
        }
    }

    public static function get(string $key, mixed $default = null): mixed {
        if (empty(self::$env)) {
            self::loadEnv();
        }
        return self::$env[$key] ?? getenv($key) ?? $default;
    }

    public static function getDbPath(): string {
        $dbPath = self::get('DB_PATH', 'storage/license.sqlite');
        if (!str_starts_with($dbPath, '/') && !preg_match('/^[A-Za-z]:/', $dbPath)) {
            $dbPath = __DIR__ . '/../' . ltrim($dbPath, '/\\');
        }
        $dir = dirname($dbPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        return $dbPath;
    }

    public static function getZipStorageDir(): string {
        $dir = __DIR__ . '/../storage/zips';
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        return realpath($dir) ?: $dir;
    }
}

Config::loadEnv();
$tz = Config::get('TIMEZONE') ?: 'Asia/Kolkata';
date_default_timezone_set($tz);
