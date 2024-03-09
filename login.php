<?php
header("Content-Type: application/json");

// grab POSTed data
$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$username = htmlentities($json_obj['username']);
$password = htmlentities($json_obj['password']);

// login logic for after user clicks log in
//check if username and password are alphanumeric --> else: try again
if(!preg_match('/[A-Za-z0-9]+/', $username) || !preg_match('/[A-Za-z0-9]+/', $password) ){
    echo json_encode(array(
		"success" => false,
		"error" => "Incorrect"
	));
	exit;
}

$mysqli = new mysqli('localhost', 'danielribeiro', 'CSE330S', 'module5');
if($mysqli->connect_errno) {
    echo json_encode(array(
		"success" => false,
        "error" => "Connection Failed: $mysqli\->connect_error"
	));
	exit;
}

// check if the EXACT account exists (must be typed case-sensitively)
$stmt = $mysqli->prepare("SELECT COUNT(*), password FROM login WHERE BINARY username=?");
if(!$stmt){
    echo json_encode(array(
		"success" => false,
        "error" => "Query Prep Failed: $mysqli\->error"
	));
    exit;
}

// bind username to statement
$stmt->bind_param('s', $username);
$stmt->execute();

// bind results to variables
$stmt->bind_result($userCount, $pwd_hash);
$stmt->fetch();
$stmt->close();

//  compare submitted password to the actual hashed password
if($userCount == 1 && password_verify($password, $pwd_hash)){
    // successful login
    ini_set("session.cookie_httponly", 1);
    session_start();
    $_SESSION['username'] = $username;
    $_SESSION['token'] = bin2hex(random_bytes(32));

    // initialize DB connection for registered-users
    require 'connection.php';
    
    echo json_encode(array(
		"success" => true
	));
	exit;
} else{
    echo json_encode(array(
		"success" => false,
		"error" => "Incorrect",       // Display: The username or password you entered is incorrect. Please try again.
	));
    exit;
}
?>