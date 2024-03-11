<?php
    ini_set("session.cookie_httponly", 1);
    session_start();
    require 'connection.php';

    // unregistered users shouldn't make it this far, but if they do, ensure they delete NO events.
    if (!isset($_SESSION['username'])) {
        echo json_encode([]);
        exit();
    }

    $username = htmlentities($_SESSION['username']);
    $data = json_decode(file_get_contents('php://input'), true);
    if(hash_equals($_SESSION['token'], $data['token'])){
        $event_id = htmlentities($data['event_id']);
        
        // checks if the logged in user is the event's creator --> allow deletion, otherwise exit (they shouldn't make it this far, but ensure NO deletion if they do)
        $stmt = $mysqli->prepare("SELECT creator FROM events WHERE event_id = ?");
        if(!$stmt){
            echo json_encode(array(
                "success" => false,
                "error" => "Query Preparation Failed: " . $mysqli->error
            ));
            exit();
        }

        $stmt->bind_param('i', $event_id);
        $stmt->execute();
        $stmt->bind_result($originalCreator);
        $stmt->fetch();
        $stmt->close();

        if($username !== $originalCreator){
            echo json_encode(array(
                "success" => false,
                "error" => "Not Original Event Creator"
            ));
            exit();
        }

        // logged in user is original event creator --> carry on deleting

        // grabs count of events
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
    }
?>