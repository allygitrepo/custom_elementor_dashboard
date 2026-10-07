<?php
$url = 'https://silverapi.allysoftsolutions.com/email/email-service';
$sender = 'test.allysoftsolutions@gmail.com';
$passkey = 'sowm fxar lzhf endf';

$headers = [
    'Content-Type: application/json',
    'email: ' . $sender,
    'passkey: ' . $passkey,
    'Email: ' . $sender,
    'Passkey: ' . $passkey
];

$payload = [
    'to' => 'vatsalparmar1742002@gmail.com',
    'subject' => 'Test Verification',
    'body' => 'This is a test',
    'html' => '<p>This is a test</p>'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Code: $code\nResponse: $res\n";
