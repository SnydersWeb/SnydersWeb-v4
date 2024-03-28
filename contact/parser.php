<?php
try {
	$name = $_POST['name'];
	$email = $_POST['email'];
	$phone = $_POST['phone'];
	$message = $_POST['message'];

	//Debugging code
	// foreach($_POST as $key => $value) {
	// 	echo("$key = $value\r\n");
	// }
	
	$to = "snydersweb@comcast.net,";
	$to .= "snydersWebCom@gmail.com,";
	$to .= "contactForm@SnydersWeb.com";
	$subject = "Feedback from website";
	$bodyL1 = "From: $name\r\n";
	$bodyL2 = "Email: $email\r\n";
	$bodyL3 = "Message: $message";   
	$body = "$bodyL1 $bodyL2 $bodyL3";
	$extra = "From: contactForm@SnydersWeb.com" . "\r\n" .
				"Reply-To: contactForm@SnydersWeb.com" . "\r\n" .
				"X-Mailer: PHP/" . phpversion();
	
	$result = mail($to, $subject, $body, $extra);

	if ($result) {
		//echo '{ "status":"Message successfully sent!", "result": "' .$result . '"}';
		//echo('{ "status":"Message successfully sent!", "result": "' .$result . '"}');
		//echo("{\"status\":\"Message successfully sent!\",\"result\":$result}");
		echo("{ 'status': 'Message successfully sent!', 'result': '$result'}");
	} else {
		//echo '{ "status":"Message delivery failed!", "result": "' .$result . '"}';
		//echo('{ "status":"Message successfully sent!", "result": "' .$result . '"}');
		//echo("{\"status\":\"Message delivery failed\",\"result\":$result}");
		echo("{ 'status': 'Message delivery failed', 'result': '$result'}");
	}

} catch (Exception $e) {
    echo("{ status: 'Message delivery failed', result: '0'}");
}   

?>