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

if(hash_equals($_SESSION['token'], $data['token'])){
    $time_start = $data['timeStart'];
    $time_end = $data['timeEnd'];

    // filters input
    if(!preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2} 00:00:00$/', $time_start)
    ||  (!preg_match('/^[[0-9]{4}-[0-9]{2}-[0-9]{2} 00:00:00]*$/', $time_end))){
        echo json_encode(array(
            "success" => false,
            "error" => "Invalid"
        ));
        exit;
    }

    // checks if end date is before start date (invalid)
    if (strtotime($time_end) < strtotime($time_start)) {
        echo json_encode(array(
            "success" => false,
            "error" => "Invalid"  // Display: Invalid Search Interval
        ));
        exit;
    }

    $tags = $data['tags'];

    // builds query if there are actively toggled tags
    $tagQuery = '';
    if(!empty($tags)){
        $tagQuery = 'AND (';
        foreach($tags as $index => $tag){
            $tagQuery .= ($index > 0 ? ' OR ' : '') . 'tag = ?';
        }
        $tagQuery .= ')';
    }

    // grabs events associated with the user
    $stmt = $mysqli->prepare("SELECT title, time_start FROM events WHERE (creator = ? OR FIND_IN_SET(?, shared_with)) AND (time_start BETWEEN ? AND ?) $tagQuery ORDER BY time_start");
    if(!$stmt){
        echo json_encode(array(
            "success" => false,
            "error" => "Query Preparation Failed: " . $mysqli->error
        ));
        exit();
    }

    // dynamically binds tags (since there could be 0, 1, 2, or 3 tags actively toggled)
    if(!empty($tags)){
        $paramString = 'ssss';
        $paramString .= str_repeat('s', count($tags));
        $params = array_merge([$username, $username, $time_start, $time_end], $tags);
        $stmt->bind_param($paramString, ...$params);
    }else{
        $stmt->bind_param('ssss', $username, $username, $time_start, $time_end);
    }
    $stmt->execute();
    $events_result = $stmt->get_result();
    $stmt->close();

    $events = array();
    while ($row = $events_result->fetch_assoc()) {
        // sanitizes output
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
}
?>