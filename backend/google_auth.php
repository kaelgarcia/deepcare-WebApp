<?php
// receives google ID token from frontend, verifies it with google,
// then creates or finds the user in the DB and returns user data.
// account manager for google auth = heart

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
$idToken = trim($data['id_token'] ?? '');

if (!$idToken) {
    echo json_encode(['success' => false, 'message' => 'No token received.']);
    exit;
}

// verify the token with Google
$googleUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
$response  = file_get_contents($googleUrl);

if ($response === false) {
    echo json_encode(['success' => false, 'message' => 'Could not verify Google token.']);
    exit;
}

$payload = json_decode($response, true);

// Check token is valid and not expired
if (!isset($payload['sub']) || !isset($payload['email'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid Google token.']);
    exit;
}

$googleId  = $payload['sub'];
$email     = $payload['email'];
$firstName = $payload['given_name']  ?? 'Google';
$lastName  = $payload['family_name'] ?? 'User';

// check if user already exists by email
$stmt = $conn->prepare('SELECT id, first_name, last_name, username, email, phone FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->bind_result($id, $dbFirst, $dbLast, $dbUsername, $dbEmail, $dbPhone);
$stmt->fetch();
$stmt->close();

if ($id) {
    // if users exist, return their info
    echo json_encode([
        'success'    => true,
        'user_id'    => $id,
        'first_name' => $dbFirst,
        'last_name'  => $dbLast,
        'fullname'   => "$dbFirst $dbLast",
        'username'   => $dbUsername,
        'email'      => $dbEmail,
        'phone'      => $dbPhone ?? ''
    ]);
} else {
    // if new user, create account with random username and fake password (since di naman nila gagamitin)
    $username = strtolower($firstName . $lastName . rand(100, 999));
    $username = preg_replace('/[^a-z0-9]/', '', $username);
    $fakePw   = password_hash($googleId . time(), PASSWORD_BCRYPT); // not used for login

    $ins = $conn->prepare(
        'INSERT INTO users (first_name, last_name, username, email, password, phone) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $empty = '';
    $ins->bind_param('ssssss', $firstName, $lastName, $username, $email, $fakePw, $empty);

    if ($ins->execute()) {
        $newId = $ins->insert_id;
        echo json_encode([
            'success'    => true,
            'user_id'    => $newId,
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'fullname'   => "$firstName $lastName",
            'username'   => $username,
            'email'      => $email,
            'phone'      => ''
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Could not create account.']);
    }
    $ins->close();
}

$conn->close();
