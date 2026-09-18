<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'Method Not Allowed', 'result' => 0]);
    exit;
}

try {
    // 1. Sanitize string inputs and strip newlines from name to prevent email header injection
    $name    = isset($_POST['name']) ? trim(preg_replace('/[\r\n]+/', ' ', $_POST['name'])) : '';
    $email   = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone   = isset($_POST['phone']) ? trim(preg_replace('/[\r\n]+/', ' ', $_POST['phone'])) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    // 2. Honeypot check: If the hidden 'website' field was filled out, pretend success and exit silently
    if (!empty($_POST['website'])) {
        echo json_encode(['status' => 'Message successfully sent!', 'result' => 1]);
        exit;
    }

    // 3. Validation
    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'Message not sent - bad or missing data', 'result' => 0]);
        exit;
    }

    // 4. Construct payload
    $to = 'snydersweb@comcast.net, snydersWebCom@gmail.com, contactForm@SnydersWeb.com';
    $subject = 'Feedback from website';

    $body  = "From: " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "\r\n";
    $body .= "Email: " . $email . "\r\n";
    if (!empty($phone)) {
        $body .= "Phone: " . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "\r\n";
    }
    $body .= "Message:\r\n" . $message . "\r\n";

    $headers = [
        'From'     => 'contactForm@SnydersWeb.com',
        'Reply-To' => $email,
        'X-Mailer' => 'PHP/' . phpversion()
    ];

    // 5. Send email via HostGator local MTA
    $result = mail($to, $subject, $body, $headers);

    if ($result) {
        echo json_encode(['status' => 'Message successfully sent!', 'result' => 1]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'Message delivery failed', 'result' => 0]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'Message delivery failed', 'result' => 0]);
}