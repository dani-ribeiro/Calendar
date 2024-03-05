<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="calendar.css">
    <title>Calendar</title>
</head>
<body>
    <!-- Page 1: Calendar (Main Page) -->
    <div id="page1-calendar">
        <!-- Header -->
        <nav class="navbar sticky-top navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <div class="brand">
                    <img src="static/calendar.png" alt="Calendar">
                    <h2 class="navbar-brand">Calendar</h2>
                </div>
                <div class="navbar-nav">
                    <div class="nav-item calendarTop">
                        <button id="previous-month" class="monthButton">
                            <img src="static/leftArrow.svg" alt="Previous Month">
                        </button>
                        <h2 id="month">Today</h2>
                        <button id="next-month" class="monthButton">
                            <img src="static/rightArrow.svg" alt="Next Month">
                        </button>
                    </div>
                    <div class="nav-item" id="todayHolder">
                        <button class="btn" id="today">Today</button>
                    </div>
                </div>
                <!-- Display this section if user is logged in -->
                <div id="registered-user-dropdown">
                    <ul class="navbar-nav">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">username</a>
                            <ul class="dropdown-menu">
                                <li><a id="signout" class="dropdown-item">Sign Out</a></li>
                            </ul>
                        </li>
                    </ul>
                    <img src="static/user.svg" alt="User Symbol" class="user">
                </div>
                <!-- end of section -->

                <!-- Display this section if user is not logged in -->
                <div id="logged-out-user-dropdown">
                    <ul class="navbar-nav">
                        <li class="nav-item dropdown">
                            <img src="static/user.svg" alt="User Symbol" class="user nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
                            <ul class="dropdown-menu">
                                <li class="dropdown-item" id="dropdownSignup">Sign Up</li>
                                <li class="dropdown-item" id="dropdownLogin">Log In</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- end of section -->

        </nav>

        <!-- Calendar -->
        <table class="table table-bordered">
            <thead>
                <tr id='daysOfWeek'>
                <th scope="col">SUN</th>
                <th scope="col">MON</th>
                <th scope="col">TUE</th>
                <th scope="col">WED</th>
                <th scope="col">THU</th>
                <th scope="col">FRI</th>
                <th scope="col">SAT</th>
                </tr>
            </thead>
            <!-- Table Body will be populated using JS below -->
            <tbody></tbody>
        </table>

        <!-- Events Modal -->
        <div class="modal fade" id="events">
            <div class="modal-dialog modal-sm modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        <h1 id='eventDayAbbreviated' class="modal-title fs-5">FRI</h1>
                        <h2 id='eventDay'>13</h2>
                    </div>
                    <div class="modal-body">
                        <button id="addEvent" type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addEventModal">Add Event</button>
                        <ul id="eventsList">
                            <li data-bs-toggle="modal" data-bs-target="#displayEventModal"><strong>12:30 PM </strong>Meeting</li>
                            <li><strong>3:20 PM </strong>Meeting</li>
                            <li><strong>5:30 PM </strong>i have a lot of stuff to do so i will type it all here for some reason</li>
                            <li><strong>7:20 PM </strong>Meeting</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Event Modal -->
        <div class="modal fade" id="addEventModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        <!-- warning -->
                        <div id="warning-add">
                            <h6>Warning!</h6>
                        </div>
                        <!-- Add Event Form  -->
                        <form id="addEventForm">
                            <!-- Title Field -->
                            <div class="row g-3">
                                <div class="col-auto">
                                <label for="addEvent-title" class="col-form-label">Title</label>
                                </div>
                                <div class="col-9">
                                <input type="text" id="addEvent-title" class="form-control" placeholder="Add Title" maxLength='30' required>
                                </div>
                            </div>
                            <!-- Date/Time Field -->
                            <div class="row g-3">
                                <div class="col-auto addEventTime">
                                    <img src="static/clock.svg" alt="Schedule">
                                    <p id='addEventFormDate' class="col-form-label">Saturday, January 13 ⋅
                                        <input type="time" id="addEvent-timeSTART" class="form-control-sm" required>
                                        -
                                        <input type="time" id="addEvent-timeEND" class="form-control-sm"> (Optional)
                                    </p>
                                </div>
                            </div>
                            <!-- Add Guests Field -->
                            <div class="row g-3">
                                <div class="col-auto">
                                    <img src="static/guests.svg" alt="Guests">
                                </div>
                                <div class="col-9 addEventGuest">
                                    <input type="text" id="addEvent-guests" class="form-control" placeholder="Add Guests (Comma Separated)">
                                </div>
                            </div>
                            <!-- Location Field -->
                            <div class="row g-3">
                                <div class="col-auto">
                                    <img src="static/location.svg" alt="Location">
                                </div>
                                <div class="col-9 addEventLocation">
                                    <input type="text" id="addEvent-location" class="form-control" placeholder="Add Location">
                                </div>
                            </div>
                            <!-- Description Field -->
                            <div class="row g-3">
                                <div class="col-auto">
                                    <img src="static/description.svg" alt="Description">
                                </div>
                                <div class="col-9 addEventDescription">
                                    <input type="text" id="addEvent-description" class="form-control" placeholder="Add Description">
                                </div>
                            </div>
                            <div class="container">
                                <button id="addEventSubmit" type="submit" class="btn btn-sm btn-primary">Add Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
            <div class="modal fade" id="displayEventModal">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button id='deleteEvent' type="button" class="btn">
                                <img src="static/trash.svg" alt="Delete Event">
                            </button>
                            <button id='editEvent' type="button" class="btn" data-bs-toggle="modal" data-bs-target="#editEventModal">
                                <img src="static/edit.svg" alt="Edit Event">
                            </button>
                            <button type="button" class="btn-close btn-close" data-bs-dismiss="modal"></button>
                            
                        </div>
                        <div class="modal-body" id="eventCard">
                            <h1 class="modal-title fs-5" id="eventTitle">Meeting</h1>
                            <p id="eventDate">Saturday, January 13 ⋅ 12:30 PM - 1:30 PM</p>
                            <p id="eventDescription">Meeting w/ Daniel</p>
                            <p id="eventLocation">20 W 34th St., New York, NY 10001</p>
                            <div id="eventGuestContainer">
                                <img src="static/guests.svg" alt="Guests">
                                <p id="eventGuests">Miguel, Pedro</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        <!-- Edit Event Modal -->
        <div class="modal fade" id="editEventModal">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-body">
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            <!-- warning -->
                            <div id="warning-edit">
                                <h6>Warning!</h6>
                            </div>
                            <!-- Add Event Form  -->
                            <form id="editEventForm">
                                <!-- Title Field -->
                                <div class="row g-3">
                                    <div class="col-auto">
                                    <label for="editEvent-title" class="col-form-label">Title</label>
                                    </div>
                                    <div class="col-9">
                                    <input type="text" id="editEvent-title" class="form-control" placeholder="Add Title" maxLength='30' required>
                                    </div>
                                </div>
                                <!-- Date/Time Field -->
                                <div class="row g-3">
                                    <div class="col-auto addEventTime">
                                        <img src="static/clock.svg" alt="Schedule">
                                        <p id='editEventFormDate' class="col-form-label">Saturday, January 13 ⋅
                                            <input type="time" id="editEvent-timeSTART" class="form-control-sm" required>
                                            -
                                            <input type="time" id="editEvent-timeEND" class="form-control-sm"> (Optional)
                                        </p>
                                    </div>
                                </div>
                                <!-- Add Guests Field -->
                                <div class="row g-3">
                                    <div class="col-auto">
                                        <img src="static/guests.svg" alt="Guests">
                                    </div>
                                    <div class="col-9 addEventGuest">
                                        <input type="text" id="editEvent-guests" class="form-control" placeholder="Add Guests (Comma Separated)">
                                    </div>
                                </div>
                                <!-- Location Field -->
                                <div class="row g-3">
                                    <div class="col-auto">
                                        <img src="static/location.svg" alt="Location">
                                    </div>
                                    <div class="col-9 addEventLocation">
                                        <input type="text" id="editEvent-location" class="form-control" placeholder="Add Location">
                                    </div>
                                </div>
                                <!-- Description Field -->
                                <div class="row g-3">
                                    <div class="col-auto">
                                        <img src="static/description.svg" alt="Description">
                                    </div>
                                    <div class="col-9 addEventDescription">
                                        <input type="text" id="editEvent-description" class="form-control" placeholder="Add Description">
                                    </div>
                                </div>
                                <div class="container">
                                    <button id="editEventSubmit" type="submit" class="btn btn-sm">Edit Event</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
    </div>

    <!-- Page 2: Log In -->
    <div id="page2-login">
        <div class="container-fluid page">
            <!-- header/navbar -->
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid justify-content-center">
                    <div class="brand">
                        <img src="static/calendar.png" alt="Calendar">
                        <h2 class="navbar-brand">Calendar</h2>
                    </div>
                </div>
                <button class="btn back" type="button">Back</button>
            </nav>
            <div class="page2body">
                <div class="left-nav"></div>
                <div class="right-nav">
                    <!-- warning -->
                    <div id="warning-login">
                        <h3>Warning!</h3>
                    </div>

                    <!-- login form -->
                    <div class="login">
                        <h3>Log In</h3>
                        <form id="login-form">
                            <label>Username <input type="text" name="login-username" id="login-username" required
                                pattern="[A-Za-z0-9]+" title="Alphanumeric characters only" maxlength="36"></label>
                            <label>Password <input type="password" name="login-password" id="login-password" required
                                pattern="[A-Za-z0-9]+" title="Alphanumeric characters only" maxlength="36"></label>
                            <button id="login-btn" type="submit">LOGIN</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 3: Sign Up -->
    <div id="page3-signup">
        <div class="container-fluid page">
            <!-- header/navbar -->
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid justify-content-center">
                    <div class="brand">
                        <img src="static/calendar.png" alt="Calendar">
                        <h2 class="navbar-brand">Calendar</h2>
                    </div>
                </div>
                <button class="btn back" type="button">Back</button>
            </nav>
            <div class="page2body">
                <div class="left-nav"></div>
                <div class="right-nav">
                    <!-- warning -->
                    <div id="warning-signup">
                        <h3>Warning!</h3>
                    </div>

                    <!-- sign up form -->
                    <div class="login">
                        <h3>Sign Up</h3>
                        <form id="signup-form">
                            <label>Username <input type="text" name="signup-username" id="signup-username" required
                                pattern="[A-Za-z0-9]+" title="Alphanumeric characters only" maxlength="36"></label>
                            <label>Password <input type="password" name="signup-password" id="signup-password" required
                                pattern="[A-Za-z0-9]+" title="Alphanumeric characters only" maxlength="36"></label>
                            <button id='signup-btn'>SIGN UP</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <!-- JQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <!-- CSE330S Calendar Library -->
    <script src="calendar_library.js" type="text/javascript"></script>
    <!-- Calendar Action Handling -->
    <script src='calendar_events.js' type="text/javascript"></script>
    <!-- User's Account Action Handling -->
    <script src='user_account.js' type="text/javascript"></script>

    <script>
        $(document).ready(function(){
            // display current month upon site load
            currentMonth = new Month(new Date().getFullYear(), new Date().getMonth());
            updateCalendar(currentMonth);
            displayPage('#page1-calendar');
        });
    </script>
</body>
</html>