<?php
    session_start();
    require 'connection.php';

    // unregistered users shouldn't make it this far, but if they do, ensure they add NO events.
    if (!isset($_SESSION['username'])) {
        echo json_encode([]);
        exit();
    }

    $username = $_SESSION['username'];
    $data = json_decode(file_get_contents('php://input'), true);
    $title = $data['title'];
    $timeStart = $data['timeStart'];
    $timeEnd = $data['timeEnd'];
    $guests = $data['guests'];
    $location = $data['location'];
    $description = $data['description'];

    // correct empty (optional) inputs for DB query
    if(empty($timeEnd)){
        $timeEnd = NULL;
    }
    if(empty($guests)){
        $guests = NULL;
    }
    if(empty($location)){
        $location = NULL;
    }
    if(empty($description)){
        $description = NULL;
    }

    // filter input
    if(!preg_match('/^[\w\d\s.,\'";:!?()$%&=\/+-]*$/', $title)
        || strlen($title) > 30
        || !preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:00$/', $timeStart)
        ||  ($timeEnd != NULL && !preg_match('/^[[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:00]*$/', $timeEnd))
        ||  ($location != NULL && !preg_match('/^[\w\d\s\',.\-\(\)]+$/', $location))
        ||  ($description != NULL && !preg_match('/^[\w\d\s.,\'";:!?()$%&=\/+-]*$/', $description))){
            echo json_encode(array(
                "success" => false,
                "error" => "Invalid"  // Display: Improper Formatting
            ));
            exit;
    }

    // if (optional) end time is provided, check if end time is before start time (invalid)
    if ($timeEnd != NULL && strtotime($timeEnd) < strtotime($timeStart)) {
        echo json_encode(array(
            "success" => false,
            "error" => "Invalid"  // Display: Improper Formatting
        ));
        exit;
    }

    // check if all guests match regex patterns (alphanumeric usernames only)
    foreach($guests as $guest){
        if(!preg_match('/^[A-Za-z0-9]+$/', $guest)){
            echo json_encode(array(
                "success" => false,
                "error" => "Invalid"  // Display: Improper Formatting
            ));
            exit;
        }
    }

    // add event
    $stmt = $mysqli->prepare("INSERT INTO events (creator, title, description, time_start, time_end, location, shared_with) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if(!$stmt){
        echo json_encode(array(
            "success" => false,
            "error" => "Query Preparation Failed: " . $mysqli->error
        ));
        exit();
    }

    // recombine guest list as 1 string "name, name, name, ..." or empty string (event not shared with anyone)
    if($guests != NULL){
        $guests = join(',', $guests);
    }


    $stmt->bind_param('sssssss', $username, $title, $description, $timeStart, $timeEnd, $location, $guests);
    $stmt->execute();
    $stmt->close();

    echo json_encode(array(
        "success" => true
    ));
    exit;
?>