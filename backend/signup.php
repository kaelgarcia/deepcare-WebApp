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

$data = json_decode(file_get_contents('php://input'), true);

$firstName = trim($data['first_name'] ?? '');
$lastName  = trim($data['last_name']  ?? '');
$username  = trim($data['username']   ?? '');
$email     = trim($data['email']      ?? '');
$password  = $data['password']        ?? '';
$phone     = trim($data['phone']      ?? '');

if (!$firstName || !$lastName || !$username || !$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

$check = $conn->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
$check->bind_param('ss', $email, $username);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email or username is already taken.']);
    $check->close();
    exit;
}
$check->close();

$hashed = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare(
    'INSERT INTO users (first_name, last_name, username, email, password, phone) VALUES (?, ?, ?, ?, ?, ?)'
);
$stmt->bind_param('ssssss', $firstName, $lastName, $username, $email, $hashed, $phone);

if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    echo json_encode([
        'success'    => true,
        'message'    => 'Account created successfully!',
        'user_id'    => $newId,
        'first_name' => $firstName,
        'last_name'  => $lastName,
        'fullname'   => "$firstName $lastName",
        'username'   => $username,
        'email'      => $email,
        'phone'      => $phone
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Could not create account. Please try again.']);
}

$stmt->close();
$conn->close();
