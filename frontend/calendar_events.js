/*
    Handle processes related to the calendar
        - Update/Load Calendar View
        - Count Events
        - Display Event Details
        - Add/Edit/Delete/Share Calendar Events
        - Toggle Calendar Tags
        - Search Calendar Events
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

// toggles event listeners for calendar tag views
const allTags = document.querySelectorAll(".tagsDropdown .dropdown-item");
allTags.forEach(tag => {
    tag.addEventListener("click", function(){
        tag.classList.toggle("active");
        updateCalendar(currentMonth);
        displayPage('#page1-calendar');
    });
});

// returns a list of actively toggled (red) tags
function getActiveTags(){
    let activeTags = [];
    allTags.forEach(tag => {
        if(tag.classList.contains('active')){
            activeTags.push(tag.textContent);
        }
    });
    return activeTags;
}

// pre: user clicks submit button on the search events form
// post: asynchronously fetches all event results during the specified time interval, or returns a warning/error for an invalid interval.
async function search(submit, activeTags = []){
    const form = document.getElementById("search-form");
    submit.preventDefault(); // prevent default form refresh upon submission
    if(form.checkValidity()){
        let startDate = document.getElementById("startDate").value + ' 00:00:00';
        let endDate = document.getElementById("endDate").value + ' 00:00:00';

        // filter form input

        // validates end date is after start date
        if(new Date(endDate) < new Date(startDate)){
            $('#warning-search h6').html('Invalid Search Interval');
            $('#warning-search').show();
            return;
        }

        const currentToken = await getToken();

        const data = {'timeStart': startDate,
                    'timeEnd': endDate,
                    'tags': activeTags,
                    'token': currentToken
                    };

        fetch("backend/search.php",{
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'content-type': 'application/json'}
            })
            .then(response => {
                if(!response.ok){
                    throw new Error("ERROR: Search - Unsuccessful");
                }else{
                    return response.json();
                }
            })
            .then(data => {
                if(data.success){
                    // successful search: close accordian, reset form --> open modal, display search results
                    $('#searchCollapse').collapse('hide');
                    document.getElementById("search-form").reset();

                    // fills search results
                    data.events.forEach(event => {
                        const title = event['title'];
                        const start_time = new Date(event['time_start']);

                        // formats the string from date to Month DD, YYYY ∙ HH:MM AM/PM
                        const formattedDate = start_time.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        });
                
                        const formattedTime = start_time.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });
                
                        // combines formattedDate (Month DD, YYYY) + formattedTime (HH:MM AM/PM) = Month DD, YYYY ∙ HH:MM AM/PM
                        const resultDateDisplay = `${formattedDate} ∙ ${formattedTime}`;

                        // creates list item for display
                        const listItem = document.createElement('li');
                        $(listItem).addClass('list-group-item');
                        const resultTitle = document.createElement('p');
                        $(resultTitle).addClass('result-title');
                        $(resultTitle).text(title);
                        const resultDate = document.createElement('p');
                        $(resultDate).addClass('result-date');
                        $(resultDate).text(resultDateDisplay);
        
                        listItem.appendChild(resultTitle);
                        listItem.appendChild(resultDate);

                        $('#resultsList').append(listItem);
                    });


                    // display search results
                    $('#searchResultsModal').modal('show');
                }else if(data.error === 'Invalid'){
                    // unsuccessful search: event interval issue
                    $('#warning-search h6').html('Invalid Search Interval');
                    $('#warning-search').show();
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

// pre: user clicks submit button on the add event form
// post: asynchronously adds event to the database and updates the calendar view, otherwise returns a warning error (invalid input, etc)
async function addEvent(event, date){
    // handle add event form submission
    const form = document.getElementById("addEventForm");
    event.preventDefault(); // prevent default form refresh upon submission
    if(form.checkValidity()){
        const title = document.getElementById("addEvent-title").value;
        let timeStart = document.getElementById("addEvent-timeSTART").value;
        let timeEnd = document.getElementById("addEvent-timeEND").value;                  // optional
        let guests = document.getElementById("addEvent-guests").value;                    // optional
        const location = document.getElementById("addEvent-location").value;              // optional
        const description = document.getElementById("addEvent-description").value;        // optional
        const tagSelected = document.querySelector("input[name='addTagOptions']:checked") ? document.querySelector("input[name='addTagOptions']:checked").value : null;   // optional

        // filter form input
        const maxTitleLength = 30;

        const titleRegex = /^[\w\d\s.,'";:!?()$%&=/+-]*$/;
        if(!titleRegex.test(title) || title.length > maxTitleLength){
            $('#warning-add h6').html('Invalid Title<br>Maximum Character Limit: 30');
            $('#warning-add').show();
        }

        // [date = YYYY-MM-DD] + [timeStart = HH:MM] = YYYY-MM-DD HH:MM:00
        timeStart = String(date + ' ' + timeStart + ':00');
        if(timeEnd){
            timeEnd = String(date + ' ' + timeEnd + ':00');

            // validate end time is after or the same as start time
            if(new Date(timeEnd) < new Date(timeStart)){
                $('#warning-add h6').html('Invalid Event Duration');
                $('#warning-add').show();
                return;
            }
        }

        // if a guest list was provided, pass it through a regex and split it.
        if(guests){
            const guestListRegex = /^[A-Za-z0-9]+(?:, [A-Za-z0-9]+)*$/;
            if(!guestListRegex.test(guests)){
                $('#warning-add h6').html('Improper Formatting<br>Please list guest usernames as comma separated values (Ex: Just, Like, This)');
                $('#warning-add').show();
                return;
            }
            guests = guests.split(',').map(guest => guest.trim());
        }

        if(location){
            const locationRegex = /^[\w\d\s',.\-\(\)]+$/;
            if(!locationRegex.test(location)){
                $('#warning-add h6').html('Invalid Location');
                $('#warning-add').show();
                return;
            }
        }

        if(description){
            const descriptionRegex = /^[\w\d\s.,'";:!?()$%&=/+-]*$/;
            if(!descriptionRegex.test(description)){
                $('#warning-add h6').html('Invalid Description');
                $('#warning-add').show();
                return;
            }
        }

        const currentToken = await getToken();

        const data = {'title': title,
                    'timeStart': timeStart,
                    'timeEnd': timeEnd,
                    'guests': guests,
                    'location': location,
                    'description': description,
                    'tag': tagSelected,
                    'token': currentToken
                    };

        fetch("backend/add_event.php", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'content-type': 'application/json'}
            })
            .then(response => {
                if(!response.ok){
                    throw new Error("ERROR: Add Event - Unsuccessful");
                }else{
                    return response.json();
                }
            })
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

// pre: user clicks delete event button
// post: asynchronously deletes event from the database and updates the calendar view
// only deletes events that the logged in user has created. Does NOT delete events that were shared with the creator (i.e. from a friend)
async function deleteEvent(event_id){
    const currentToken = await getToken();
    const data = {'event_id': event_id,
                  'token': currentToken
                 };
    fetch("backend/delete.php", {
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

// pre: user clicks submit button on the edit event form
// post: asynchronously updates the event in the database and updates the calendar view, otherwise returns a warning error (invalid input, etc)
// only edit events that the logged in user has created. Does NOT edit events that were shared with the creator (i.e. from a friend)
async function editEvent(submit, date, event_id){
    // handle edit event form submission
    const form = document.getElementById("editEventForm");
    submit.preventDefault();     // prevent default form refresh upon submission
    if(form.checkValidity()){
        const title = document.getElementById("editEvent-title").value;
        let timeStart = document.getElementById("editEvent-timeSTART").value;
        let timeEnd = document.getElementById("editEvent-timeEND").value;                  // optional
        let guests = document.getElementById("editEvent-guests").value;                    // optional
        const location = document.getElementById("editEvent-location").value;              // optional
        const description = document.getElementById("editEvent-description").value;        // optional
        const tagSelected = document.querySelector("input[name='editTagOptions']:checked") ? document.querySelector("input[name='editTagOptions']:checked").value : null;   // optional

        // filter form input
        const maxTitleLength = 30;

        const titleRegex = /^[\w\d\s.,'";:!?()$%&=/+-]*$/;
        if(!titleRegex.test(title) || title.length > maxTitleLength){
            $('#warning-edit h6').html('Invalid Title<br>Maximum Character Limit: 30');
            $('#warning-edit').show();
        }

        // date = YYYY-MM-DD HH:MM:DD
        const dateNoTime = date.substring(0,10);
        timeStart = String(dateNoTime + ' ' + timeStart + ':00');
        if(timeEnd){
            timeEnd = String(dateNoTime + ' ' + timeEnd + ':00');

            // validate end time is after or the same as start time
            if(new Date(timeEnd) < new Date(timeStart)){
                $('#warning-edit h6').html('Invalid Event Duration');
                $('#warning-edit').show();
                return;
            }
        }

        // if a guest list was provided, pass it through a regex and split it.
        if(guests){
            const guestListRegex = /^[A-Za-z0-9]+(?:, [A-Za-z0-9]+)*$/;
            if(!guestListRegex.test(guests)){
                $('#warning-edit h6').html('Improper Formatting<br>Please list guest usernames as comma separated values (Ex: Just, Like, This)');
                $('#warning-edit').show();
                return;
            }
            guests = guests.split(',').map(guest => guest.trim());
        }

        if(location){
            const locationRegex = /^[\w\d\s',.\-\(\)]+$/;
            if(!locationRegex.test(location)){
                $('#warning-edit h6').html('Invalid Location');
                $('#warning-edit').show();
                return;
            }
        }

        if(description){
            const descriptionRegex = /^[\w\d\s.,'";:!?()$%&=/+-]*$/;
            if(!descriptionRegex.test(description)){
                $('#warning-edit h6').html('Invalid Description');
                $('#warning-edit').show();
                return;
            }
        }

        const currentToken = await getToken();

        const data = {'event_id': event_id,
                    'title': title,
                    'timeStart': timeStart,
                    'timeEnd': timeEnd,
                    'guests': guests,
                    'location': location,
                    'description': description,
                    'tag': tagSelected,
                    'token': currentToken
                    };

        fetch("backend/edit_event.php", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'content-type': 'application/json'}
            })
            .then(response => {
                if(!response.ok){
                    throw new Error("ERROR: Edit Event - Unsuccessful");
                }else{
                    return response.json();
                }
            })
            .then(data => {
                if(data.success){
                    // successful edit event: reset form --> update calendar --> display calendar
                    updateCalendar(currentMonth);
                    $('#editEventModal').modal('hide');
                    displayPage('#page1-calendar');
                }else if(data.error === 'Invalid'){
                    // unsuccessful add event: formatting issue
                    $('#warning-edit h6').html('Improper Formatting');
                    $('#warning-edit').show();
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


// pre: user selects an event to view
// post: displays the event details for a specific event
function eventDetails(event, username){
    // resets event listeners from previous dates
    $('#deleteEvent').off('click');
    $('#editEventSubmit').off('click');

    // only allow user to edit & delete if they're the original event creator
    if(event['creator'] === username){
        $('#deleteEvent').show();
        $('#editEvent').show();
        // delete event
        $('#deleteEvent').click(function(){
            deleteEvent(event['event_id']);
        });

        // editEvent trigger
        $('#editEventSubmit').click(function(submit){
            editEvent(submit, event['time_start'], event['event_id']);
        });

        // if user edits an event --> prefill the edit event modal with the current contents
        $('#editEventModal').on('show.bs.modal', function(){
            let title = document.getElementById("editEvent-title");
            title.value = event['title'];
            
            // formats date to WEEKDAY, MONTH DAY ∙  ex: "Saturday, January 13 ∙ "
            let form_date = new Date(event['time_start']);
            form_date.setDate(form_date.getDate());
            form_date = form_date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
            form_date += " ∙ ";

            $('#editEventFormDate').html(`${form_date}
                                        <input type="time" id="editEvent-timeSTART" class="form-control-sm" required>
                                        -
                                        <input type="time" id="editEvent-timeEND" class="form-control-sm"> (Optional)`);
            
            let timeStart = document.getElementById("editEvent-timeSTART");
            timeStart.value = event['time_start'].substring(11,16);     // grab only HH:MM from date string

            let timeEnd = document.getElementById("editEvent-timeEND");     // optional
            if(event['time_end']){
                timeEnd.value = event['time_end'].substring(11,16);
            }

            let guests = document.getElementById("editEvent-guests");       // optional
            if(event['shared_with']){
                guests.value = event['shared_with'].split(',').map(guest => guest.trim()).join(', ');
            }

            let location = document.getElementById("editEvent-location");                // optional
            if(event['location']){
                location.value = event['location'];
            }
            
            let description = document.getElementById("editEvent-description");          // optional
            if(event['description']){
                description.value = event['description'];
            }
        });
    }else{  // logged in user is NOT the original event creator --> don't let them delete or edit
        $('#deleteEvent').hide();
        $('#editEvent').hide();
    }

    const eventTitle = document.getElementById('eventTitle');
    const eventDate = document.getElementById('eventDate');
    const eventDescription = document.getElementById('eventDescription');
    const eventLocation = document.getElementById('eventLocation');
    const eventTag = document.getElementById('eventTag');
    const eventGuests = document.getElementById('eventGuests');

    eventTitle.textContent = event['title'];

    const start_date = new Date(event['time_start']);
    // formats date to WEEKDAY, MONTH DAY  ex: "Saturday, January 13"
    const formatted_date = start_date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    let dateString = formatted_date + " ∙ ";

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

    // the following are optional entries --> only displayed if provided
    if(!event['description']){
        $(eventDescription).hide();
    }
    if(!event['location']){
        $(eventLocation).hide();
    }
    if(!event['tag']){
        $('#eventTagContainer').hide();
    }
    if(!event['shared_with']){
        $('#eventGuestContainer').hide();
    }
    // set the content elements with empty strings
    eventDescription.textContent = event['description'];
    eventLocation.textContent = event['location'];
    eventTag.textContent = event['tag'];
    eventGuests.textContent = event['shared_with'].split(',').join(', ');
}


// pre: user clicks on a day to view or add events on, and user has tags toggled (could have 0 tags toggled)
// post: asynchronously fetches all events associated with the logged-in user (user-created or user-shared with events) for the specific date 
//       requested and only those associated with the toggled tags
async function loadEvents(username, date, activeTags = []){
    const currentToken = await getToken();

    const data = {'username' : username,
                    'date': date,
                    'tags': activeTags,
                    'token': currentToken
                    };
    fetch("backend/fetch_events.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'content-type': 'application/json'}
    })
    .then(response => {
        if(!response.ok){
            throw new Error("ERROR: Load Events - Unsuccessful");
        }else{
            return response.json();
        }
    })
    .then(result => {
        if(result.success){
            const eventsList = document.getElementById('eventsList');
            eventsList.innerHTML = '';

            // add events
            // remove event listener from previous dates
            $('#addEventSubmit').off('click');

            // addEvent trigger
            $('#addEventSubmit').click(function(event){
                addEvent(event, date);
                return;
            });

            $('#addEventModal').on('show.bs.modal', function(){
                // formats date to WEEKDAY, MONTH DAY ∙  ex: "Saturday, January 13 ∙ "
                let form_date = new Date(date);
                form_date.setDate(form_date.getDate() + 1);             // adjust for 0-based month indexing
                form_date = form_date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                });
                form_date += " ∙ ";

                $('#addEventFormDate').html(`${form_date}
                                            <input type="time" id="addEvent-timeSTART" class="form-control-sm" required>
                                            -
                                            <input type="time" id="addEvent-timeEND" class="form-control-sm"> (Optional)`);
            });

            result.events.forEach(event => {
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

                $(listItem).click(function(){
                    // unhide the optional elements
                    $('#eventDescription').show();
                    $('#eventLocation').show();
                    $('#eventTagContainer').show();
                    $('#eventGuestContainer').show();
                    // display event card
                    eventDetails(event, username);
                });

                eventsList.appendChild(listItem);
            });
        }
    })
    .catch(err => console.error(err));
}

// reformats date for MySQL query processing: 
// Thu Feb 01 2024 00:00:00 GMT-0600 (Central Standard Time) --> 2024-02-01
function formatDate(date){
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');     // [+1 bc months are 0-based in calendar_library.js], [padStart adds a 0 to the beginning if the month is single digit]
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// pre: user interacts with the calendar, resulting in an update
// post: asynchronously fetches the event counts for each date in the current month (given the currently toggled tags) from the database and updates the calendar view
function countEvents(date, cell, username, activeTags = []){
    const formattedDate = formatDate(date);
    const data = {'username' : username,
                'date': formattedDate,
                'tags': activeTags
                }
    fetch("backend/count_events.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'content-type': 'application/json'}
    })
    .then(response => {
        if(!response.ok){
            throw new Error("ERROR: Count Events - Unsuccessful");
        }else{
            return response.json();
        }
    })
    .then(result => {
        if(result.success){
            const day = date.getDate();
            const numEvents = result.eventCount;
            if(username != false && cell){
                if(numEvents > 0){
                    cell.innerHTML = `<strong>${day}</strong>
                                    <p class="numEvents">${numEvents} Events</p>`;
                }
                $(cell).click(function(){
                    // update the event modal with the clicked day (number: 0-31) and day of the week (abbreviation: SUN-SAT)
                    document.getElementById('eventDay').textContent = day;
                    const colIndex = $(cell).index();
                    const dayOfWeek = $('#daysOfWeek th').eq(colIndex).text();
                    document.getElementById('eventDayAbbreviated').textContent = dayOfWeek;
                    // load the event modal for the clicked day
                    loadEvents(username, formattedDate, activeTags);
                });
            }
        }
    })
    .catch(err => console.error(err));
}

// loads calendar grid with days positioned accordingly
async function loadCalendar(month){
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
            if(date.getMonth() === month.month){
                cell.innerHTML = `<strong>${date.getDate()}</strong>
                                    <p class="numEvents"></p>`;
                cell.id = `cell${date.getDate()}`;
                
                // if user is logged in --> allow them to view/add/remove events
                if(usernameResult != false){
                    cell.setAttribute("data-bs-toggle", "modal");
                    cell.setAttribute("data-bs-target", "#events");

                    // get the user's toggled tags
                    let activeTags = getActiveTags();
                    countEvents(date, cell, usernameResult, activeTags);
                }
            }
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
}

// updates calendar view to today's month
function today(){
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    currentMonth = new Month(todayYear, todayMonth);
    updateCalendar(currentMonth);
}

// updates calendar view to the next month
function nextMonth(){
    currentMonth = currentMonth.nextMonth();
    updateCalendar(currentMonth);
}

// updates calendar view to the previous month
function previousMonth(){
    currentMonth = currentMonth.prevMonth();
    updateCalendar(currentMonth);
}

// updates <MONTH YEAR> header & load the respective month's calendar view
function updateCalendar(month){
    document.getElementById('month').innerText = monthDict[month.month] + " " + month.year;
    loadCalendar(month);
}

// additional event listeners

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

$('#editEvent').click(function(){
    $('#warning-edit').hide();
})

$('#addEventModal').on('hidden.bs.modal', function(){
    const addEventForm = document.getElementById("addEventForm");
    addEventForm.reset();
});

$('#editEventModal').on('hidden.bs.modal', function(){
    const editEventForm = document.getElementById("editEventForm");
    editEventForm.reset();
    $('#editEventModal').off('show.bs.modal');
});

$('#searchCollapse').on('show.bs.collapse', function(){
    $('#warning-search').hide();
});

$('#searchSubmit').click(function(event){
    let activeTags = getActiveTags();
    search(event, activeTags);
});

$('#searchResultsModal').on('hidden.bs.modal', function(){
    $('#resultsList').html('');
});