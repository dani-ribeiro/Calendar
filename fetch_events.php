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

// grab events associated with the user
$stmt = $mysqli->prepare("SELECT event_id, title, time_start, time_end, description, location, shared_with, creator, tag FROM events WHERE (creator = ? OR FIND_IN_SET(?, shared_with)) AND DATE(time_start) = ? ORDER BY time_start");
if(!$stmt){
    echo json_encode(array(
		"success" => false,
		"error" => "Query Preparation Failed: " . $mysqli->error
	));
    exit();
}

$stmt->bind_param('sss', $username, $username, $date);
$stmt->execute();
$events_result = $stmt->get_result();
$stmt->close();

$events = array();
while ($row = $events_result->fetch_assoc()) {
    // if the event creator is NOT the currently logged in user, then this is a shared_with event
    // swap the guest list display such that the original creator is swapped with the logged in user
    // ex: Daniel shared post with "Bob,Dylan" --> Then we want Bob's calendar to display "Daniel, Dylan" NOT "Bob, Dylan"
    if ($row['creator'] !== $username && !empty($row['shared_with'])) {
        $shared_with = explode(',', $row['shared_with']);
        $swapIndex = array_search($username, $shared_with);
        if ($swapIndex !== false) {
            $shared_with[$swapIndex] = $row['creator'];
        }
        $row['shared_with'] = implode(',', $shared_with);
    }

    // sanitize output
    $sanitizedRow = array();
    foreach ($row as $key => &$value) {
        $sanitizedRow[$key] = htmlentities($value);
    }
    $events[] = $sanitizedRow;
}

echo json_encode(array(
    "success" => true,
    "events" => $events
));
?>