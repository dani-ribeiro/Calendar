<?php
ini_set("session.cookie_httponly", 1);
header("Content-Type: application/json");

// grab POSTed data
$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$username = htmlentities($json_obj['username']);
$password = htmlentities($json_obj['password']);

// signup & login logic for after user clicks sign up            
//check if username and password are alphanumeric --> else: try again
if(!preg_match('/^[A-Za-z0-9]+$/', $username) || !preg_match('/^[A-Za-z0-9]+$/', $password) ){
    echo json_encode(array(
		"success" => false,
		"error" => "Invalid"  // Display: Invalid Username or Password. Please try again.
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

$stmt = $mysqli->prepare("SELECT COUNT(*) FROM login WHERE username=?");
if(!$stmt){
    echo json_encode(array(
		"success" => false,
        "error" => "Query Prep Failed: $mysqli\->error"
	));
    exit;
}

$stmt->bind_param('s', $username);
$stmt->execute();

$stmt->bind_result($userCount);
$stmt->fetch();
$stmt->close();

//check if username already exists --> try again. else: create account!
if($userCount == 0){
    //new user! salt hash password & create account
    $hash_pwd = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $mysqli->prepare("INSERT into login (username, password) values (?, ?)");
    if(!$stmt){
        echo json_encode(array(
            "success" => false,
            "error" => "Query Prep Failed: $mysqli\->error"
        ));
        exit;
    }
    $stmt->bind_param('ss', $username, $hash_pwd);
    $stmt->execute();
    $stmt->close();
    
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
		"error" => "Username Exists",       // Display: Username <username> already exists.
        "attemptedUsername" => $username
	));
    exit;
}
?>