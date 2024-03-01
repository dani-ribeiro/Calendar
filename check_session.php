<?php
session_start();

if (isset($_SESSION['username'])) {
    echo json_encode(array('loggedIn' => true, 'username' => $_SESSION['username']));
} else {
    echo json_encode(array('loggedIn' => false));
}
?>