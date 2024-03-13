const test = require('./global');

run_test();

async function run_test(){
    // Create account tests
    await test.test_case({method: 'create-account', username: '', password: ''});
    await test.test_case({method: 'create-account', username: 'abc', password: ''});
    await test.test_case({method: 'create-account', username: 'abc', password: '1234'});
    await test.test_case({method: 'create-account', username: 'abc', password: '12345678'});
    await test.test_case({method: 'create-account', username: 'abc', password: '12345678'}); // Duplicate account
    console.log("Excecuted create account tests");
    await test.test_case({method: 'delete-account', username: 'abc', password: '12345678'});
    console.log("Cleaned up")
}