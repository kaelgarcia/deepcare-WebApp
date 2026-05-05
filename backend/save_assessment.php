<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$data    = json_decode(file_get_contents('php://input'), true);
$userId  = intval($data['user_id'] ?? 0);

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

$age       = trim($data['age']       ?? '');
$gender    = trim($data['gender']    ?? '');
$skinType  = trim($data['skin_type'] ?? '');
$skinFeel  = trim($data['skin_feel'] ?? '');
$concerns  = trim($data['concerns']  ?? '');
$allergies = trim($data['allergies'] ?? '');

// update if exists, insert if not
$stmt = $conn->prepare('
    INSERT INTO assessments (user_id, age, gender, skin_type, skin_feel, concerns, allergies)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        age       = VALUES(age),
        gender    = VALUES(gender),
        skin_type = VALUES(skin_type),
        skin_feel = VALUES(skin_feel),
        concerns  = VALUES(concerns),
        allergies = VALUES(allergies),
        updated_at = CURRENT_TIMESTAMP
');
$stmt->bind_param('issssss', $userId, $age, $gender, $skinType, $skinFeel, $concerns, $allergies);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Assessment saved.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Could not save assessment.']);
}

$stmt->close();
$conn->close();
