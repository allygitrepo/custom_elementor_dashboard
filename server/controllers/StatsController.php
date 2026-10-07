<?php
// server/controllers/StatsController.php
require_once __DIR__ . '/../database/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class StatsController {
    public static function getStats(): void {
        AuthMiddleware::authenticate();
        $pdo = Database::getConnection();

        // 1. Total Licenses
        $totalLicenses = (int)$pdo->query("SELECT COUNT(*) FROM licenses")->fetchColumn();
        
        // 2. Active, Suspended, Revoked
        $activeLicenses = (int)$pdo->query("SELECT COUNT(*) FROM licenses WHERE status = 'active'")->fetchColumn();
        $suspendedLicenses = (int)$pdo->query("SELECT COUNT(*) FROM licenses WHERE status = 'suspended'")->fetchColumn();
        $revokedLicenses = (int)$pdo->query("SELECT COUNT(*) FROM licenses WHERE status = 'revoked'")->fetchColumn();

        // 3. Deployed Domains Breakdown
        $totalDeployed = (int)$pdo->query("SELECT COUNT(*) FROM licenses WHERE deployed_domain IS NOT NULL AND deployed_domain != ''")->fetchColumn();
        
        $localhostCount = (int)$pdo->query("
            SELECT COUNT(*) FROM licenses 
            WHERE deployed_domain LIKE '%localhost%' 
               OR deployed_domain LIKE '%127.0.0.1%' 
               OR deployed_domain LIKE '%.local%'
               OR deployed_domain LIKE '%.test%'
        ")->fetchColumn();

        $liveDomainCount = max(0, $totalDeployed - $localhostCount);

        // 4. Total Revenue
        $totalRevenue = (float)$pdo->query("SELECT SUM(amount) FROM orders WHERE status = 'completed'")->fetchColumn();

        // 5. Recent Activity Logs
        $activityStmt = $pdo->query("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 15");
        $recentActivities = $activityStmt->fetchAll();

        // 6. Recent Deployments
        $recentDeployments = $pdo->query("
            SELECT id, license_key, customer_name, customer_email, deployed_domain, deployed_ip, activation_date, last_ping_date, status
            FROM licenses 
            WHERE deployed_domain IS NOT NULL AND deployed_domain != ''
            ORDER BY last_ping_date DESC LIMIT 10
        ")->fetchAll();

        echo json_encode([
            'success' => true,
            'stats' => [
                'total_licenses' => $totalLicenses,
                'active_licenses' => $activeLicenses,
                'suspended_licenses' => $suspendedLicenses,
                'revoked_licenses' => $revokedLicenses,
                'total_deployed' => $totalDeployed,
                'localhost_count' => $localhostCount,
                'live_domain_count' => $liveDomainCount,
                'total_revenue' => $totalRevenue
            ],
            'recent_activities' => $recentActivities,
            'recent_deployments' => $recentDeployments
        ]);
    }

    public static function getLogs(): void {
        AuthMiddleware::authenticate();
        $pdo = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 30)));
        $offset = ($page - 1) * $limit;

        $count = (int)$pdo->query("SELECT COUNT(*) FROM activity_logs")->fetchColumn();
        $stmt = $pdo->prepare("SELECT * FROM activity_logs ORDER BY id DESC LIMIT $limit OFFSET $offset");
        $stmt->execute();
        $logs = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $logs,
            'pagination' => [
                'total' => $count,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($count / $limit)
            ]
        ]);
    }
}
