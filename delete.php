<?php
    session_start();
    require 'connection.php';

    // unregistered users shouldn't make it this far, but if they do, ensure they delete NO events.
    if (!isset($_SESSION['username'])) {
        echo json_encode([]);
        exit();
    }

    $username = $_SESSION['username'];
    $data = json_decode(file_get_contents('php://input'), true);
    $event_id = $data['event_id'];

    // grab count of events
    $stmt = $mysqli->prepare("DELETE FROM events WHERE creator = ? AND event_id = ?");
    if(!$stmt){
        echo json_encode(array(
            "success" => false,
            "error" => "Query Preparation Failed: " . $mysqli->error
        ));
        exit();
    }

    $stmt->bind_param('si', $username, $event_id);
    $stmt->execute();
    $stmt->close();

    echo json_encode(array(
        "success" => true
    ));
    exit;
?>