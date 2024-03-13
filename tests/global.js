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
        return {status: res.error ? "ERROR" : "SUCCESS", data: data, result: res.error ? res.error : Object.keys(res.stmtResult)};
    } else {
        return {status: `ERROR : ${response.status}`, data: data};
    }
}

// Test POST requests
async function test_case(data = {}) {
    let response = await req(add, data);
    console.log(response);
}

module.exports = {test_case, add, req, fetch_wrap}