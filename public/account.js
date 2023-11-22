const signInModalContent = `<h1>Please Sign In</h1> <hr> <br>
<label>Username:</label>
<input type="text" id="username" /><br>
<label>Password:</label>
<input type="password" id="password" /><br> <br>
<button id="submit-login" onclick="login()">Submit</button>
<button id="switch-mode" onclick="showCreateAccountModal()">Create Account</button>
<div id="modal_output"></div>`;

const createAccountModalContent = `<h1>Please Create An Account</h1> <hr> <br>
<label>Username:</label>
<input type="text" id="username" /><br>
<label>Password:</label>
<input type="password" id="password" /><br>
<label>Re-enter Password:</label>
<input type="password" id="password-re-entry" /><br> <br>
<button id="submit-login" onclick="submitCreateAccount()">Submit</button>
<button id="switch-mode" onclick="showLoginModal()">Sign In</button>
<div id="modal_output"></div>`;

const modal = document.getElementById('login-modal');
const modalContent = document.getElementById('login-modal-content');

let accountID = null; 

if (!accountID) { // CHECK SESSION ID HERE
    showLoginModal();
}

function showLoginModal(){
    modalContent.innerHTML = signInModalContent; // Sets content
    modal.style.display = 'block'; // Shows sign-in modal
}

function showCreateAccountModal(){
    modalContent.innerHTML = createAccountModalContent; // Sets content
    modal.style.display = 'block'; // Shows sign-in modal
}

function hideModals() {
    modal.style.display = 'none'; // Hides modal
}

async function submitCreateAccount(){
    const passwordInput = document.getElementById('password');
    const passwordReentryInput = document.getElementById('password-re-entry');
    if (passwordInput.value != passwordReentryInput.value){
        modalOutput('Passwords do not match.')
        return;
    }
    const dataToSubmit = {
        method: 'create-account',
        username: document.getElementById('username').value,
        password: passwordInput.value 
    }
    const result = await req('/', dataToSubmit);
    
    if (result.error) { // If account creation fails
        if (result.error.errno == 19){
            modalOutput('An account with that username already exists.\nPlease try a different username.');
        } else if (result.error.errno == 0) {
            modalOutput(result.error.errdsc);
        } else {
            modalOutput('UNKOWN ERROR - Account creation failed.');
        }
    } else {
        alert('Account created!');
        hideModals();
        saveAccountID(result.stmtResult.lastID);
    }
}

async function login(){
    const dataToSubmit = {
        method: 'log-in',
        username: document.getElementById('username').value,
        password: document.getElementById('password').value 
    }
    const result = await req('/', dataToSubmit);
    if (result.error){ // If login fails
        if (result.error.errno == 0) {
            modalOutput(result.error.errdsc);
        } else {
            modalOutput('UNKOWN ERROR - Account creation failed.');
        }
    } else {
        alert('Succesfully logged in.');
        hideModals();
        saveAccountID(result.stmtResult.accountID);
    }
}

function saveAccountID(id){
    accountID = id;
    console.log(id);
}

function modalOutput(output){
    document.getElementById('modal_output').innerText = output;
}

async function req(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'omit',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(data),
    });
    if (response.ok){
        return response.json();
    }
}


