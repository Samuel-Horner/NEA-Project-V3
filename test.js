const add = 'http://localhost:8080';

async function fetch_wrap(url, data){
    return fetch(url, data).then(res => {return res;}).catch(err => {console.log(err, data); return err;});
}

async function req(url = '', data = {}) {
    const response = await fetch_wrap(url, {
        method: 'POST',
        credentials: 'omit',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(data),
    });
    if (response.ok){
        let res = await response.json();
        return {status: "SUCCESS", data: data, result: res.error ? res.error : Object.keys(res.stmtResult)};
    } else {
        return {status: "ERROR", data: data};
    }
}

// Test POST requests
async function test_case(data = {}) {
    let response = await req(add, data);
    console.log(response);
}

// Automated test cases

tests();

async function tests() {
    // Testing invalid requests
    await fetch_wrap(add, {method: 'POST', body: {}}); // Blank body
    await fetch_wrap(add, {method: 'POST', body: "{key: }"}); // Invalid JSON
    await fetch_wrap(add, {}); // Blank request body
    await fetch_wrap(add, {method: 'GET'});
    await fetch_wrap(add, {method: 'POST', headers: {'content-type': 'blah'}});

    console.log("Excecuted invalid fetch request tests");

    await test_case({}); // Blank body
    await test_case({method: 'create-account'}); // Valid method with no data
    await test_case({method: 'blah'}); // Invalid method

    // Load project tests
    await test_case({method: 'load-project', projectID: 0}); // Invalid project ID
    await test_case({method: 'load-project', projectID: -1}); // Invalid project ID
    await test_case({method: 'load-project', projectID: 'abc'}); // Invalid project ID data type
    await test_case({method: 'load-project', projectID: 2}); // Valid project ID but not yet used
    await test_case({method: 'load-project', projectID: 1}); // Valid project ID

    // create account tests
    await test_case({method: 'create-account', username: '', password: ''});
    await test_case({method: 'create-account', username: 'abc', password: ''});
    await test_case({method: 'create-account', username: 'abc', password: '1234'});
    await test_case({method: 'create-account', username: 1234, password: '12345678'});
    await test_case({method: 'create-account', username: 'abc', password: '12345678'});
    await test_case({method: 'create-account', username: 'abc', password: '12345678'}); // Duplicate account

    // Delete account tests
    await test_case({method: 'delete-account', username: 'abc', password: '12345678'});
    await test_case({method: 'delete-account', username: 'abc', password: '12345678'}); // deleting an account that has already been deleted
    await test_case({method: 'delete-account', username: 1234, password: '12345678'});
    await test_case({method: 'create-account', username: 'test', password: '12345678'})
    await test_case({method: 'delete-account', username: '', password: ''});
    await test_case({method: 'delete-account', username: 'test', password: ''});
    await test_case({method: 'delete-account', username: '', password: '12345678'});
    await test_case({method: 'delete-account', username: 'test', password: '1234'});
    await test_case({method: 'delete-account', username: 'test', password: '12345678'});

    console.log("Excecuted valid fetch request tests");
}
