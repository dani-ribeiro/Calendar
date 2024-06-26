/*
    Handle processes related to a user's account
        - Sign Up
        - Login
        - Sign Out
        - ...
*/

// gets CSRF token if user is logged in
function getToken(){
    return fetch("backend/check_session.php")
    .then(response => {
        if(!response.ok){
            throw new Error("Unsuccessful get token");
        }else{
            return response.json();
        }
    })
    .then(data => {
        if(data.loggedIn){
            return data.token;
        }else{
            return false;
        }
    })
    .catch(err => console.error(err));
}


// pre: user signs out, logs in, or enters some form data and leaves without submitting
// post: resets form to blank state
function resetForms(){
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    loginForm.reset();
    signupForm.reset();
}

// checks if user is logged in --> returns username if logged in     else: return false (not logged in)
function checkLoggedIn(){
    return fetch("backend/check_session.php")
    .then(response => {
        if(!response.ok){
            throw new Error("Unsuccessful check logged in");
        }else{
            return response.json();
        }
    })
    .then(data => {
        if(data.loggedIn){
            return data.username;
        }else{
            return false;
        }
    })
    .catch(err => console.error(err));
}

// handles sign up form submission
function signup(event) {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    const data = {'username': username,
                'password': password};

    event.preventDefault(); // prevent default form refresh upon submission

    fetch("backend/signup.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'}
        })
        .then(response => {
            if(!response.ok){
                throw new Error("Unsuccessful sign up.");
            }else{
                return response.json();
            }
        })
        .then(data => {
            if(data.success){
                displayPage('#page1-calendar');
                updateCalendar(currentMonth);
            }else if(data.error === 'Username Exists'){     // if username already exists --> return warning message and allow user to try again
                $('#warning-signup h3').text(`Username ${data.attemptedUsername} already exists. Please try again.`);
                $('#warning-signup').show();
            }else if(data.error === 'Invalid'){
                $('#warning-signup h3').text(`Invalid Username or Password. Please try again.`);
                $('#warning-signup').show();
            }else{      // query prep failed or DB connection failed --> start over
                displayPage('#page1-calendar');
            }
        })
        .catch(err => console.error(err));
    return false; // prevent default form submission behavior
}

// handles log in form submission
function login(event) {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const data = {'username': username,
                'password': password};

    event.preventDefault(); // prevent default form refresh upon submission

    fetch("backend/login.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'content-type': 'application/json'}
        })
        .then(response => {
            if(!response.ok){
                throw new Error("Unsuccessful log in.");
            }else{
                return response.json();
            }
        })
        .then(data => {
            if(data.success){
                displayPage('#page1-calendar');
                updateCalendar(currentMonth);
            }else if(data.error === 'Incorrect'){     // incorrect login details (or invalid characters) --> prompt user to try again
                $('#warning-login h3').text('The username or password you entered is incorrect. Please try again.');
                $('#warning-login').show();
            }else{      // query prep failed or DB connection failed --> start over
                displayPage('#page1-calendar');
            }
        })
        .catch(err => console.error(err));
}

// handles sign out
function signout() {
    fetch("backend/signout.php", {
            method: 'POST',
            headers: {'content-type': 'application/json'}
        })
        .then(response => {
            if(!response.ok){
                throw new Error("Unsuccessful sign out.");
            }else{
                updateCalendar(currentMonth);
                $('td').off('click', '#events');
                displayPage('#page1-calendar');
            }
        })
        .catch(err => console.error(err));
}

// displays registered-user dashboard if the user is logged in      else: displays logged-out-user dashboard
async function displayDashboard() {
    try {
        const loggedIn = await checkLoggedIn();
        if(loggedIn != false){
            $('#logged-out-user-dropdown').hide();
            $('.registered-user-view').show();
            $('#registered-user-dropdown .nav-link.dropdown-toggle').text(loggedIn); // update username in dropdown
        }else{
            $('.registered-user-view').hide();
            $('#logged-out-user-dropdown').show();
        }
    }catch (err) {
        console.error(err);
    }
}

// hides all pages EXCEPT the page to display
function displayPage(pageID) {
    $('#page1-calendar, #page2-login, #page3-signup').hide();
    if(pageID === '#page1-calendar'){
        displayDashboard();     // display registered-user dashboard or unregistered-user dashboard depending if user is logged in
    }
    $(pageID).show();
}

// additional event listeners

$('#dropdownSignup').click(function(){
    $('#warning-signup').hide();
    displayPage('#page3-signup');
});

$('#dropdownLogin').click(function(){
    $('#warning-login').hide();
    displayPage('#page2-login');
});

$('.back').click(function(){
    displayPage('#page1-calendar');
    resetForms();
});

// signout form submit button
$('#signout').click(function(){
    signout();
});

$('#signup-btn').click(function(event){
    signup(event);
    resetForms();
});

$('#login-btn').click(function(event){
    login(event);
    resetForms();
});