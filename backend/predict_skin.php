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

$tmpPath  = $_FILES['image']['tmp_name'];
$mimeType = mime_content_type($tmpPath);

if (!str_starts_with($mimeType, 'image/')) {
    echo json_encode(['success' => false, 'message' => 'Uploaded file is not an image.']);
    exit;
}

$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "http://127.0.0.1:8000/predict",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => [
        'file' => new CURLFile($tmpPath, $mimeType, $_FILES['image']['name'])
    ]
]);

$response  = curl_exec($curl);
$curlError = curl_error($curl);
$httpCode  = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($curlError || $response === false) {
    echo json_encode([
        'success' => false,
        'message' => 'Could not reach the AI server. Make sure it is running. Error: ' . $curlError
    ]);
    exit;
}

if ($httpCode !== 200) {
    echo json_encode([
        'success' => false,
        'message' => 'AI server returned an error (HTTP ' . $httpCode . ').'
    ]);
    exit;
}

echo $response;
?>