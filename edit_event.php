<?php
    ini_set("session.cookie_httponly", 1);
    session_start();
    require 'connection.php';

    // unregistered users shouldn't make it this far, but if they do, ensure they edit NO events.
    if (!isset($_SESSION['username'])) {
        echo json_encode([]);
        exit();
    }

    $username = htmlentities($_SESSION['username']);
    $data = json_decode(file_get_contents('php://input'), true);
    if(hash_equals($_SESSION['token'], $data['token'])){
        $event_id = htmlentities($data['event_id']);

        // check if the logged in user is the event's creator --> allow edit, otherwise exit (they shouldn't make it this far, but ensure NO edits if they do)
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

        // logged in user is original event creator --> carry on editing

        $title = htmlentities($data['title']);
        $timeStart = $data['timeStart'];
        $timeEnd = $data['timeEnd'];
        $guests = $data['guests'];
        $location = htmlentities($data['location']);
        $description = htmlentities($data['description']);

        // correct empty (optional) inputs for DB query
        $timeEnd = empty($timeEnd) ? NULL : $timeEnd;
        $guests = empty($guests) ? NULL : $guests;
        $location = empty($location) ? NULL : $location;
        $description = empty($description) ? NULL : $description;

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

        // edit event
        $stmt = $mysqli->prepare("UPDATE events SET title=?, description=?, time_start=?, time_end=?, location=?, shared_with=? WHERE event_id=?");
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


        $stmt->bind_param('ssssssi', $title, $description, $timeStart, $timeEnd, $location, $guests, $event_id);
        $stmt->execute();
        $stmt->close();

        echo json_encode(array(
            "success" => true
        ));
        exit;
    }
?>