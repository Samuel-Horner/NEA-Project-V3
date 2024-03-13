const test = require('./global');

run_test();

async function run_test(){
    // Load project tests
    await test.test_case({method: 'load-project', projectID: 0}); // Invalid project ID
    await test.test_case({method: 'load-project', projectID: -1}); // Invalid project ID
    await test.test_case({method: 'load-project', projectID: 'abc'}); // Invalid project ID data type
    await test.test_case({method: 'load-project', projectID: 2}); // Valid project ID but not yet used
    await test.test_case({method: 'load-project', projectID: 1}); // Valid project ID
    console.log("Excecuted load project tests"); 
}