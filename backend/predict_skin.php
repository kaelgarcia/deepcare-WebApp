<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}

if (!isset($_FILES['image'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No image uploaded.'
    ]);
    exit;
}

$imagePath = $_FILES['image']['tmp_name'];

$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "http://127.0.0.1:8000/predict",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => [
        'file' => new CURLFile($imagePath)
    ]
]);

$response = curl_exec($curl);

curl_close($curl);

echo $response;
?>