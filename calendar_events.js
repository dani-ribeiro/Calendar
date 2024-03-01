/*
    Handle processes related to the calendar
        - Update/Load Calendar View
        - Count Events
        - Display Event Details
        - ...
*/

monthDict = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December"
}

function addEvent(event, date){
    // handle add event form submission
    const form = document.getElementById("addEventForm");
    event.preventDefault(); // prevent default form refresh upon submission
    if(form.checkValidity()) {
        const title = document.getElementById("addEvent-title").value;
        let timeStart = document.getElementById("addEvent-timeSTART").value;
        let timeEnd = document.getElementById("addEvent-timeEND").value;                  // optional
        let guests = document.getElementById("addEvent-guests").value;                    // optional
        const location = document.getElementById("addEvent-location").value;              // optional
        const description = document.getElementById("addEvent-description").value;        // optional

        // filter form input

        const titleRegex = /^[\w\d\s.,'";:!?()$%&=/+-]*$/;
        if (!titleRegex.test(title)) {
            $('#warning-add h6').html('Invalid Title');
            $('#warning-add').show();
            return;
        }

        // [date = YY-MM-DD] + [timeStart = HH:MM] = YY-MM-DD HH:MM:00
        timeStart = String(date + ' ' + timeStart + ':00');
        if(timeEnd){
            timeEnd = String(date + ' ' + timeEnd + ':00');
        }

        // if a guest list was provided, pass it through a regex and split it.
        if(guests){
            const guestListRegex = /^[A-Za-z0-9]+(?:, [A-Za-z0-9]+)*$/;
            if (!guestListRegex.test(guests)) {
                $('#warning-add h6').html('Improper Formatting<br>Please list guest usernames as comma separated values (Ex: Just, Like, This)');
                $('#warning-add').show();
                return;
            }
            guests = guests.split(',').map(guest => guest.trim());
        }

        if(location){
            const locationRegex = /^[\w\d\s',.\-\(\)]+$/;
            if (!locationRegex.test(location)) {
                $('#warning-add h6').html('Invalid Location');
                $('#warning-add').show();
                return;
            }
        }

        if(description){
            const descriptionRegex = /^[\w\d\s.,'";:!?()$%&=/+-]*$/;
            if (!descriptionRegex.test(description)) {
                $('#warning-add h6').html('Invalid Description');
                $('#warning-add').show();
                return;
            }
        }

        const data = {'title': title,
                    'timeStart': timeStart,
                    'timeEnd': timeEnd,
                    'guests': guests,
                    'location': location,
                    'description': description
                    };

        fetch("add_event.php", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'content-type': 'application/json'}
            })
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    // successful add event: reset form --> update calendar --> display calendar
                    updateCalendar(currentMonth);
                    $('#addEventModal').modal('hide');
                    displayPage('#page1-calendar');
                }else if(data.error === 'Invalid'){
                    // unsuccessful add event: formatting issue
                    $('#warning-add h6').html('Improper Formatting');
                    $('#warning-add').show();
                }else{
                    console.log(data['error']);
                    displayPage('#page1-calendar');
                }
            })
            .catch(err => console.error(err));
    }else{
        form.reportValidity();
    }
    

}

// delete only events that the logged in user has created. DO NOT delete events that were shared with the creator (i.e from a friend)
function deleteEvent(event_id){
    const data = {'event_id' : event_id};
    fetch("delete.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'content-type': 'application/json'}
    })
    .then(response => {
        if(response.ok){
            updateCalendar(currentMonth);
            $('#displayEventModal').modal('hide');
            displayPage('#page1-calendar');
        }else{
            console.log("Error Deleting Event");
        }
    })
    .catch(err => console.error(err));
}

// select & display all details for a specific event
function eventDetails(event){
    // if user deletes an event --> disable the event listener & delete the event
    $('#deleteEvent').click(function(){
        $('#deleteEvent').off('click');
        deleteEvent(event['event_id']);
    });

    const eventTitle = document.getElementById('eventTitle');
    const eventDate = document.getElementById('eventDate');
    const eventDescription = document.getElementById('eventDescription');
    const eventLocation = document.getElementById('eventLocation');
    const eventGuests = document.getElementById('eventGuests');

    eventTitle.textContent = event['title'];

    const start_date = new Date(event['time_start']);
    // formats date to WEEKDAY, MONTH DAY  ex: "Saturday, January 13"
    const formatted_date = start_date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    let dateString = formatted_date + " ⋅ ";

    // formats date to HH:MM AM/PM
    const start_time = start_date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    dateString += start_time;

    if(event['time_end']){
        const end_time = new Date(event['time_end']);
        const formatted_end_time = end_time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        dateString += " - " + formatted_end_time;
    }

    eventDate.innerHTML = `<p id='eventDate'>${dateString}</p>`;

    eventDescription.textContent = event['description'];
    eventLocation.textContent = event['location'];
    eventGuests.textContent = event['shared_with']
}

// select & display all events on a certain date associated with the logged in user
function loadEvents(username, date){
    const data = {'username' : username,
                    'date': date
                    };
    fetch("fetch_events.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'content-type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
        if(result.success){
            const eventsList = document.getElementById('eventsList');
            eventsList.innerHTML = '';

            // remove event listener from previous dates
            $('#addEventSubmit').off('click');

            // addEvent trigger
            $('#addEventSubmit').click(function(event){
                addEvent(event, date);
                return;
            });

            $('#addEventModal').on('show.bs.modal', function(event) {
                // formats date to WEEKDAY, MONTH DAY ⋅  ex: "Saturday, January 13 ⋅ "
                let form_date = new Date(date);
                form_date.setDate(form_date.getDate() + 1);             // adjust for 0-based month indexing
                form_date = form_date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                });
                form_date += " ⋅ ";

                $('#addEventFormDate').html(`${form_date}
                                            <input type="time" id="addEvent-timeSTART" class="form-control-sm" required>
                                            -
                                            <input type="time" id="addEvent-timeEND" class="form-control-sm"> (Optional)`);
            });

            result.events.forEach(event => {
                // const event_id = event['event_id'];
                const title = event['title'];
                const start_time = new Date(event['time_start']);
                // formats the string from date to HH:MM AM/PM
                const formatted_time = start_time.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                
                const listItem = document.createElement('li');
                listItem.setAttribute("data-bs-toggle", "modal");
                listItem.setAttribute("data-bs-target", "#displayEventModal");
                listItem.innerHTML = `<strong>${formatted_time}</strong> ${title}`;

                $(listItem).click(function() {
                    eventDetails(event);
                });

                eventsList.appendChild(listItem);
            });
        }
    })
    .catch(err => console.error(err));
}

// reformats date for MySQL query processing: 
// Thu Feb 01 2024 00:00:00 GMT-0600 (Central Standard Time) --> 2024-02-01
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');     // [+1 bc months are 0-based in calendar_library.js], [padStart adds a 0 to the beginning if the month is single digit]
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// count & display number of events for a specific date (cell) in the current calendar view
function countEvents(date, cell, username){
    const formattedDate = formatDate(date);
    const data = {'username' : username,
                'date': formattedDate
                }
    fetch("count_events.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'content-type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
        if(result.success){
            const day = date.getDate();
            const numEvents = result.eventCount;
            if(username != false && cell){
                if(numEvents > 0){
                    cell.innerHTML = `<strong>${day}</strong>
                                    <p class="numEvents">${numEvents} Events</p>`;
                }
                $(cell).click(function() {
                    // update the event modal with the clicked day (number: 0-31) and day of the week (abbreviation: SUN-SAT)
                    document.getElementById('eventDay').textContent = day;
                    const colIndex = $(cell).index();
                    const dayOfWeek = $('#daysOfWeek th').eq(colIndex).text();
                    document.getElementById('eventDayAbbreviated').textContent = dayOfWeek;
                    // load the event modal for the clicked day
                    loadEvents(username, formattedDate);
                });
            }
        }
    })
    .catch(err => console.error(err));
}

// loads calendar grid with days positioned accordingly
async function loadCalendar(month) {
    //check if user is logged in (to be used below)     usernameResult = <username> if logged in, otherwise it stores false
    const usernameResult = await checkLoggedIn();
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '';       // changed month --> reset calendar view

    const weeks = month.getWeeks();

    // iterate & display each week of the month
    weeks.forEach((week, weekIndex) => {
        const dates = week.getDates();

        // create new table row for each new week
        const row = document.createElement('tr');
        row.id = `week${weekIndex + 1}`;

        // iterate & display each day of the week
        dates.forEach(date => {
            const cell = document.createElement('td');
            cell.innerHTML = '';        // reset cell day content just in case of overlap (next step)
            cell.id = '';

            // check if current day is in the current month --> add it to the calendar view!        else: don't. empty cell.
            if (date.getMonth() === month.month) {
                cell.innerHTML = `<strong>${date.getDate()}</strong>
                                    <p class="numEvents"></p>`;
                cell.id = `cell${date.getDate()}`;
                
                // if user is logged in --> allow them to view/add/remove events
                if(usernameResult != false){
                    cell.setAttribute("data-bs-toggle", "modal");
                    cell.setAttribute("data-bs-target", "#events");
                    countEvents(date, cell, usernameResult);
                }
            }
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
}

// update calendar view to today's month
function today(){
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    currentMonth = new Month(todayYear, todayMonth);
    updateCalendar(currentMonth);
}

// update calendar view to the next month
function nextMonth() {
    currentMonth = currentMonth.nextMonth();
    updateCalendar(currentMonth);
}

// update calendar view to the previous month
function previousMonth() {
    currentMonth = currentMonth.prevMonth();
    updateCalendar(currentMonth);
}

// update <MONTH YEAR> header & load the respective month's calendar view
function updateCalendar(month) {
    document.getElementById('month').innerText = monthDict[month.month] + " " + month.year;
    loadCalendar(month);
}

$('#previous-month').click(function(){
    previousMonth();
});
$('#next-month').click(function(){
    nextMonth();
});
$('#today').click(function(){
    today();
});

$('#addEvent').click(function(){
    $('#warning-add').hide();
})

$('#addEventModal').on('hidden.bs.modal', function() {
    const addEventForm = document.getElementById("addEventForm");
    addEventForm.reset();
});