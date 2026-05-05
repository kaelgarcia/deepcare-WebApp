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

$data     = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password']     ?? '';

if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'Please enter your username and password.']);
    exit;
}

$stmt = $conn->prepare(
    'SELECT id, first_name, last_name, username, email, phone, password FROM users WHERE username = ? OR email = ? LIMIT 1'
);
$stmt->bind_param('ss', $username, $username);
$stmt->execute();
$stmt->bind_result($id, $firstName, $lastName, $uname, $email, $phone, $hashed);
$stmt->fetch();
$stmt->close();

if ($id && password_verify($password, $hashed)) {
    echo json_encode([
        'success'    => true,
        'message'    => 'Login successful!',
        'user_id'    => $id,
        'first_name' => $firstName,
        'last_name'  => $lastName,
        'fullname'   => "$firstName $lastName",
        'username'   => $uname,
        'email'      => $email,
        'phone'      => $phone ?? ''
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Incorrect username or password.']);
}

$conn->close();
