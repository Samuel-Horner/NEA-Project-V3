// Different Modal Contents
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

const accountMgmtModalContent = `<h1>Account Management</h1> <hr> <br>
<button onclick="logout()">Sign Out</button> <br> <br>
<button onclick="showDeleteAccountModal()">Delete Account</button> <br> <br> 
<button onclick="hideModals()">Close</button>`

const deleteAccountModalContent = `<h1>Delete Account</h1> <hr> <br>
<p>Deleting an account will permenantly delete all saved projects.</p>
<label>Password:</label>
<input type="password" id="password" /><br>
<button onclick="deleteAccount()">Delete Account</button>
<button onclick="showLoginModal()">Cancel</button>
<div id="modal_output"></div>`;

// Initialising constants and fetching account info
const modal = document.getElementById('login-modal');
const modalContent = document.getElementById('login-modal-content');
const projectList = document.getElementById('project-list-ul');

let accUsername = window.sessionStorage.getItem('username');
let accPassword = window.sessionStorage.getItem('password');

if (!accUsername) {showLoginModal();}
else {
    loadProjects();
    document.getElementById('page-info').innerText = accUsername;
}

// Modal Management
function showLoginModal(){
    if(!accUsername){modalContent.innerHTML = signInModalContent;}// Sets content if not logged in
    else{modalContent.innerHTML = accountMgmtModalContent;}
    modal.style.display = 'block'; // Shows sign-in modal
}

function showCreateAccountModal(){
    modalContent.innerHTML = createAccountModalContent; // Sets content
    modal.style.display = 'block'; // Shows sign-in modal
}

function showDeleteAccountModal(){
    modalContent.innerHTML = deleteAccountModalContent; // Sets content
    modal.style.display = 'block'; // Shows sign-in modal
}

function hideModals() {
    modal.style.display = 'none'; // Hides modal
}

function modalOutput(output){
    document.getElementById('modal_output').innerText = output;
}

// Database operations
async function submitCreateAccount(){
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    const passwordReentryInput = document.getElementById('password-re-entry');
    if (passwordInput.value != passwordReentryInput.value){
        modalOutput('Passwords do not match.')
        return;
    }
    const dataToSubmit = {
        method: 'create-account',
        username: usernameInput.value,
        password: passwordInput.value 
    }
    req('/', dataToSubmit).then(result => {
        if (result.error) { // If account creation fails
            if (result.error.errno == 19){
                modalOutput('An account with that username already exists.\nPlease try a different username.');
            } else if (result.error.errno == 0) {
                modalOutput(result.error.errdsc);
            } else {
                modalOutput('UNKOWN ERROR - Account creation failed.');
            }
        } else {
            hideModals();
            saveAccountInfo(usernameInput.value, passwordInput.value);
        }
    }).catch(error => {
        modalOutput('UNKOWN ERROR - Account creation failed.');
    });
}

function login(){
    const dataToSubmit = {
        method: 'log-in',
        username: document.getElementById('username').value,
        password: document.getElementById('password').value 
    }
    req('/', dataToSubmit).then(result => {
        if (result.error){ // If login fails
            if (result.error.errno == 0) {
                modalOutput(result.error.errdsc);
            } else {
                modalOutput('UNKOWN ERROR - Sign in failed.');
            }
        } else {
            hideModals();
            saveAccountInfo(result.stmtResult.username, document.getElementById('password').value);
        }
    }).catch(error => {
        modalOutput('UNKOWN ERROR - Sign in failed.');
    });
}

function deleteAccount(){
    req(url = '/', {
        method: 'delete-account',
        username: accUsername,
        password: document.getElementById('password').value
    }).then(res => {
        if (res.error){
            if (res.error.errno == 0) {
                modalOutput(res.error.errdsc);
            } else {
                modalOutput('UNKOWN ERROR - Delete account failed.');
            }
        } else {
            logout();
        }
    });
}

function loadProjects(){
    projectList.innerHTML = '';
    if (!accUsername){
        return;
    }
    req(url = '/', {
        method: 'get-projects',
        username: accUsername
    }).then(res => {
        if (!res.stmtResult){
            if (res.error.errno == 0){
                projectList.innerHTML = `Uh oh - looks like you dont have any saved projects!<br><a href='/editor.html'>Make a new project?</a><br><a href='http://localhost:8080/editor.html?projectid=1'>View an example project?</a>`;
                return;
            } else if (res.error.errno == 1){
                window.sessionStorage.clear(); // Invalid account username in session storage
                accUsername = null;
                showLoginModal(); // Reload page
                return;
            }
        }
        res.stmtResult.forEach(project => {
            projectList.innerHTML += projectListTemplate(project.projectName, project.projectID);
        });
        projectList.innerHTML += '<br><button onclick="editProject(null)">Create New</button>';
    });
}

function deleteProject(projectID){
    req(url = '/', {
        method: 'delete-project',
        username: accUsername,
        password: accPassword,
        projectID: projectID
    }).then(res => {
        if (res.error){
            if (result.error.errno == 0) {
                alert(result.error.errdsc);
            } else {
                alert('UNKOWN ERROR - Delete account failed.');
            }
        } else {
            loadProjects();
        }
    });
}

// Manages account information
function logout(){
    saveAccountInfo(null, null)
    loadProjects();
    showLoginModal();
}

function saveAccountInfo(username, password){
    accUsername = username;
    accPassword = password;
    // Could do something with cookies here to make account info
    // persist through pages, but not in project scope.
    window.sessionStorage.setItem('password', password);
    window.sessionStorage.setItem('username', username);
    document.getElementById('page-info').innerText = username;
    loadProjects();
}

// Project list management
function projectListTemplate(projectName, projectID){
    return `<li class="project-list-li"">
                <span onclick="editProject(${projectID})" class="project-name">${projectName}</span>
                <button onclick="deleteProject(${projectID})" class="project-delete-button">Delete</button>
            </li>`;
}

// Redirects to editor page
function editProject(projectID){
    if (projectID == null){
        window.location = '/editor.html';
        return;
    }
    window.location = `/editor.html?projectid=${projectID}`;
}
