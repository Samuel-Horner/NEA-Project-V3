const signInModalContent = `<h1>Please Sign In</h1> <hr> <br>
<label>Username:</label>
<input type="text" id="username" /><br>
<label>Password:</label>
<input type="password" id="password" /><br> <br>
<button id="submit-login">Submit</button>
<button id="switch-mode" onclick="showCreateAccountModal()">Create Account</button>`;

const createAccountModalContent = `<h1>Please Create An Account</h1> <hr> <br>
<label>Username:</label>
<input type="text" id="username" /><br>
<label>Password:</label>
<input type="password" id="password" /><br>
<label>Re-enter Password:</label>
<input type="password" id="password-re-entry" /><br> <br>
<button id="submit-login" onclick="submitCreateAccount()">Submit</button>
<button id="switch-mode" onclick="showLoginModal()">Sign In</button>`;

const modal = document.getElementById('login-modal');
const modalContent = document.getElementById('login-modal-content');

if (true) { // CHECK SESSION ID HERE
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
    modal.style.display = 'none'; // Shows sign-in modal
}

async function submitCreateAccount(){
    const passwordInput = document.getElementById('password');
    const passwordReentryInput = document.getElementById('password-re-entry');
    if (passwordInput.value != passwordReentryInput.value){
        alert('Passwords do not match.')
        return;
    }
    const dataToSubmit = {
        method: 'create-account',
        username: document.getElementById('username').value,
        password: passwordInput.value 
    }
    const result = await req('/', dataToSubmit);
    console.log(result);
    
    if (result.error) { // If account creation fails
        if (result.error.errno == 19){
            alert('An account with that username already exist.\nPlease try a different username.');
        } else if (result.error.errno == 0) {
            alert(result.error.errDsc);
        } else {
            alert('UNKOWN ERROR - Account creation failed.');
        }
    } else {
        alert('Account created!');
        hideModals();
    }
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


