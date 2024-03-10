<?php
ini_set("session.cookie_httponly", 1);
session_start();
require 'connection.php';

// unregistered users shouldn't make it this far, but if they do, ensure they see NO events.
if (!isset($_SESSION['username'])) {
    echo json_encode([]);
    exit();
}

$username = htmlentities($_SESSION['username']);
$data = json_decode(file_get_contents('php://input'), true);
$date = htmlentities($data['date']);
$tags = $data['tags'];

// if there are active tags --> build query
$tagQuery = '';
if (!empty($tags)) {
    $tagQuery = 'AND (';
    foreach ($tags as $index => $tag) {
        $tagQuery .= ($index > 0 ? ' OR ' : '') . 'tag = ?';
    }
    $tagQuery .= ')';
}

// grab count of events
$stmt = $mysqli->prepare("SELECT COUNT(*) FROM events WHERE (creator = ? OR FIND_IN_SET(?, shared_with)) AND DATE(time_start) = ? $tagQuery");
if(!$stmt){
    echo json_encode(array(
		"success" => false,
		"error" => "Query Preparation Failed: " . $mysqli->error
	));
    exit();
}

// dynamically bind tags
if (!empty($tags)) {
    $paramString = 'sss';
    $paramString .= str_repeat('s', count($tags));
    $params = array_merge([$username, $username, $date], $tags);
    $stmt->bind_param($paramString, ...$params);
} else {
    $stmt->bind_param('sss', $username, $username, $date);
}
$stmt->execute();
$stmt->bind_result($eventCount);
$stmt->fetch();
$stmt->close();

// sanitize output
$eventCount = htmlentities($eventCount);

echo json_encode(array(
    "success" => true,
    "eventCount" => $eventCount
));
?>