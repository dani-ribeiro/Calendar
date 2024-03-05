<?php
session_start();
require 'connection.php';

// unregistered users shouldn't make it this far, but if they do, ensure they see NO events.
if (!isset($_SESSION['username'])) {
    echo json_encode([]);
    exit();
}

$username = $_SESSION['username'];
$data = json_decode(file_get_contents('php://input'), true);
$date = $data['date'];

// grab count of events
$stmt = $mysqli->prepare("SELECT COUNT(*) FROM events WHERE creator = ? AND DATE(time_start) = ?");
if(!$stmt){
    echo json_encode(array(
		"success" => false,
		"error" => "Query Preparation Failed: " . $mysqli->error
	));
    exit();
}

$stmt->bind_param('ss', $username, $date);
$stmt->execute();
$stmt->bind_result($eventCount);
$stmt->fetch();
$stmt->close();

echo json_encode(array(
    "success" => true,
    "eventCount" => $eventCount
));
?>