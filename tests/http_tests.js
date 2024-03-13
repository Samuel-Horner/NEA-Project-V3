const test = require('./global');

run_test();

async function run_test(){
    // Testing invalid requests
    await test.fetch_wrap(test.add, {method: 'POST', body: {}}); // Blank body
    await test.fetch_wrap(test.add, {method: 'POST', body: "{key: }"}); // Invalid JSON
    await test.fetch_wrap(test.add, {}); // Blank request body
    await test.fetch_wrap(test.add, {method: 'GET'});
    await test.fetch_wrap(test.add, {method: 'POST', headers: {'content-type': 'blah'}});

    console.log("Excecuted invalid fetch request tests");

    await test.test_case({}); // Blank body
    await test.test_case({method: 'create-account'}); // Valid method with no data
    await test.test_case({method: 'blah'}); // Invalid method

    console.log("Excecuted invalid method tests");
}