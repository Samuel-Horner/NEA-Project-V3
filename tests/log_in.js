const test = require('./global');

run_test();

async function run_test(){
    // Log in tests
    await test.test_case({method: 'create-account', username: 'test', password: '12345678'});
    console.log("Initialised DB")
    await test.test_case({method: 'log-in'});
    await test.test_case({method: 'log-in', username: '', password: ''});
    await test.test_case({method: 'log-in', username: 'test', password: ''});
    await test.test_case({method: 'log-in', username: '', password: '12345678'});
    await test.test_case({method: 'log-in', username: 'test', password: '1234'});
    await test.test_case({method: 'log-in', username: 'test', password: '12345678'});
    console.log("Excecuted log in tests");
    await test.test_case({method: 'delete-account', username: 'test', password: '12345678'});
    console.log("Cleaned up")
}