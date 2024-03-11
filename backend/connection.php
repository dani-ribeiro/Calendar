<?php
if (session_status() == PHP_SESSION_NONE) {
    ini_set("session.cookie_httponly", 1);
    session_start();
}

$mysqli;

// registered user: select/insert/update/delete access
if(isset($_SESSION['username']) && !empty($_SESSION['username'])){
    $mysqli = new mysqli('localhost', 'registered-user', 'module5', 'module5');
    if($mysqli->connect_errno) {
        printf("Connection Failed: %s\n", $mysqli->connect_error);
        exit;
    }
}
?>