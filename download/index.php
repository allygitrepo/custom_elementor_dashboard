<?php
// download/index.php
// Dynamically resolve base URL and serve SPA index with 100% path independence
$rootIndex = dirname(__DIR__) . '/index.html';
if (!file_exists($rootIndex)) {
    http_response_code(404);
    echo "Frontend build index.html not found.";
    exit;
}

$html = file_get_contents($rootIndex);

// Compute root directory path dynamically
$scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$scriptDir = str_replace('\\', '/', $scriptDir);
$baseHref = rtrim($scriptDir, '/') . '/';
if (empty($baseHref) || $baseHref === '/') {
    $baseHref = './';
}

// Ensure base tag is injected for perfect subpath asset loading
if (!str_contains($html, '<base ')) {
    $html = preg_replace('/<head>/i', "<head>\n    <base href=\"{$baseHref}\">", $html);
}

header('Content-Type: text/html; charset=UTF-8');
echo $html;
exit;
