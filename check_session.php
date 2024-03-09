<?php
ini_set("session.cookie_httponly", 1);
session_start();

if (isset($_SESSION['username'])) {
    echo json_encode(array('loggedIn' => true, 'username' => $_SESSION['username'], 'token' => $_SESSION['token']));
} else {
    echo json_encode(array('loggedIn' => false));
}
?>