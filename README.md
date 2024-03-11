# CSE330
# Author: Daniel Ribeiro d.d.ribeiro@wusl.edu, ID: 511148, GitHub: dani-ribeiro

### Link:
* Calendar: http://ec2-44-201-138-135.compute-1.amazonaws.com/~danielribeiro/Module5/group/calendar.html

* Ease Of Use (Basic Features):
    * Sign Up / Log In: Click the person in the top right corner
    * Sign Out: Log In --> Click on your username in the top right --> Sign Out
    * Previous Month / Next Month: Top middle of the screen. Click the arrows around < Month Year >
    * Add Event: Log In --> Click on a day's table cell --> Click on Add Event
    * Edit Event: Log In --> Click on the day's table cell --> Click on the event you want to edit --> Click the pencil icon in the top right (between the trash can and the X)
    * Delete Event: Log In --> Click on the day's table cell --> Click on the event you want to delete --> Click on the trash can in the top right

* If you need any login information to the MySQL Database:
    * danielribeiro
        * password: CSE330S       
        * Access: ALL priviledges on ALL tables.
    * registered-user
        * password: module5
        * Access: SELECT, INSERT, UPDATE, DELETE on event table

### Creative Portion:
* Users can tag an event with a particular category and enable/disable those tags in the calendar view
    * Only logged in users can enable/disable tags.
    * Enable/Disable Tags: Log in --> Click on Calendar Tags (left side of calendar) --> Toggle any calendar tags on/off. 
        * If a tag is red, you are ONLY viewing events associated with the red tag(s).
        * If you want to see ALL events (even those with NO tags), untoggle all tags. That is, make all tags white again.
    * To add/change a tag to an event, select a tag when creating/editing an event.
    * To remove a tag from an event, edit the event and DON'T select a tag.

* Users can create group events that display on multiple users calendars
    * Only logged in users can share events.
    * When creating/editing an event, include all of the usernames of people you would like to share the event with. Comma separated (ex: 'Just, Like, This')
    * To unshare an event with somebody, edit the event and remove them from the guest list.

* Users can search/filter for events in their calendar within a range of dates
    * Only logged in users can search for events.
    * Search Events: Log in --> Click on Search (left side of calendar) --> Enter a starting and ending date as your search interval.
        * NOTE: Search Interval is exclusive. [start date, end date)

* Small Feature - Users can immediately jump to the current month no matter how far forward/backward they were previously looking in the calendar
    * Both registered and unregistered users can use the "Today" feature located above the calendar, to the right of < Month Year >

### Web Server Contents
* Module5/group/... : All pages/styling for the site. Same contents as the repository
    * [calendar.html](calendar.html): Calendar page
    
    * [calendar_library.js](calendar_library.js): Calendar API provided by the [CSE 330S Wiki](https://classes.engineering.wustl.edu/cse330/index.php?title=JavaScript_Calendar_Library)

    * backend: All .php backend processes
        * [add_event.php](backend/add_event.php), [check_session.php](backend/check_session.php), [connection.php](backend/connection.php),
            [count_events.php](backend/count_events.php), [delete.php](backend/delete.php), [edit_event.php](backend/edit_event.php),
            [fetch_events.php](backend/fetch_events.php), [login.php](backend/login.php), [search.php](backend/search.php),
            [signout.php](backend/signout.php), [signup.php](backend/signup.php)

    * frontend: All .js frontend processes
        * [calendar_events.js](frontend/calendar_events.js), [user_account.js](frontend/user_account.js)

    * static: All images used

    * stylesheets: calendar.css stylesheet
        * [calendar.css](stylesheets/calendar.css)

## Repository Contents
* Same contents as above [Web Server Contents](#web-server-contents)