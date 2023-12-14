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
<button onclick="showDeleteAccountModal()">Delete Account</button>`

const deleteAccountModalContent = `<h1>Delete Account</h1> <hr> <br>
<p>Deleting an account will permenantly delete all saved projects.</p>
<label>Password:</label>
<input type="password" id="password" /><br>
<button onclick="deleteAccount()">Delete Account</button>
<button onclick="showLoginModal()">Cancel</button>
<div id="modal_output"></div>`;

const modal = document.getElementById('login-modal');
const modalContent = document.getElementById('login-modal-content');
const projectList = document.getElementById('project-list-ul');

let accountID = window.sessionStorage.getItem('accountID');
let accPassword = window.sessionStorage.getItem('password');

if (!accountID) {showLoginModal();}
else {loadProjects();}

function showLoginModal(){
    if(!accountID){modalContent.innerHTML = signInModalContent;}// Sets content if not logged in
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
            saveAccountID(result.stmtResult.lastID, passwordInput.value);
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
            saveAccountID(result.stmtResult.accountID, document.getElementById('password').value);
        }
    }).catch(error => {
        modalOutput('UNKOWN ERROR - Sign in failed.');
    });
}

function logout(){
    accountID = null;
    loadProjects();
    showLoginModal();
}

function deleteAccount(){
    req(url = '/', {
        method: 'delete-account',
        accountID: accountID,
        password: document.getElementById('password').value
    }).then(res => {
        if (res.error){
            if (result.error.errno == 0) {
                modalOutput(result.error.errdsc);
            } else {
                modalOutput('UNKOWN ERROR - Delete account failed.');
            }
        } else {
            accountID = null;
            loadProjects();
            showLoginModal();
        }
    });
}

function saveAccountID(id, password){
    accountID = id;
    accPassword = password;
    // Could do something with cookies here to make account info
    // persist through pages, but not in project scope.
    window.sessionStorage.setItem('accountID', id);
    window.sessionStorage.setItem('password', password);
    window.sessionStorage.setItem('username', document.getElementById('username').value);
    loadProjects();
}

function loadProjects(){
    projectList.innerHTML = '';
    if (!accountID){
        return;
    }
    req(url = '/', {
        method: 'get-projects',
        accountID: accountID
    }).then(res => {
        if (res.stmtResult.length == 0){
            projectList.innerHTML = `Uh oh - looks like you dont have any saved projects!<br><a href='/editor.html'>Make a new project?</a>`
            return;
        }
        res.stmtResult.forEach(project => {
            projectList.innerHTML += projectListTemplate(project.projectName, project.projectID);
        });
        projectList.innerHTML += '<br><button onclick="editProject(null)">Create New</button>';
    });
}

function projectListTemplate(projectName, projectID){
    return `<li class="project-list-li"">
                <span onclick="editProject(${projectID})" class="project-name">${projectName}</span>
                <button onclick="deleteProject(${projectID})" class="project-delete-button">Delete</button>
            </li>`;
}

function editProject(projectID){
    if (projectID == null){
        window.location = '/editor.html';
        return;
    }
    window.location = `/editor.html?projectid=${projectID}`;
}

function deleteProject(projectID){
    req(url = '/', {
        method: 'delete-project',
        accountID: accountID,
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

function modalOutput(output){
    document.getElementById('modal_output').innerText = output;
}



