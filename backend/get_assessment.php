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

$data   = json_decode(file_get_contents('php://input'), true);
$userId = intval($data['user_id'] ?? 0);

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

$stmt = $conn->prepare('SELECT age, gender, skin_type, skin_feel, concerns, allergies FROM assessments WHERE user_id = ? LIMIT 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$stmt->bind_result($age, $gender, $skinType, $skinFeel, $concerns, $allergies);

if ($stmt->fetch()) {
    echo json_encode([
        'success'   => true,
        'age'       => $age,
        'gender'    => $gender,
        'skin_type' => $skinType,
        'skin_feel' => $skinFeel,
        'concerns'  => $concerns,
        'allergies' => $allergies
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'No assessment found.']);
}

$stmt->close();
$conn->close();
