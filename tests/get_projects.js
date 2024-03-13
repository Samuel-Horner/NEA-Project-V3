const test = require('./global');

run_test();

async function run_test(){
    // Get Project tests
    await test.test_case({method: 'get-projects'});
    await test.test_case({method: 'get-projects', username: ''});
    await test.test_case({method: 'get-projects', username: 'blah'});
    await test.test_case({method: 'get-projects', username: 'Example Account'}); // Fetching example project
    console.log("Excecuted get projects tests");
}