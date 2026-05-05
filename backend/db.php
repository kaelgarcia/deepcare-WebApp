<?php
// edit the credentials below to match your MySQL setup

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');          
define('DB_NAME', 'deepcare_db');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

$conn->set_charset('utf8mb4');
