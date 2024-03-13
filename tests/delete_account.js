const test = require('./global');

run_test();

async function run_test(){
    await test.test_case({method: 'create-account', username: 'abc', password: '12345678'});
    console.log("Initialised DB");
    // Delete account tests
    await test.test_case({method: 'delete-account', username: 'abc', password: '12345678'});
    await test.test_case({method: 'delete-account', username: 'abc', password: '12345678'}); // deleting an account that has already been deleted
    await test.test_case({method: 'create-account', username: 'test', password: '12345678'})
    await test.test_case({method: 'delete-account', username: '', password: ''});
    await test.test_case({method: 'delete-account', username: 'test', password: ''});
    await test.test_case({method: 'delete-account', username: '', password: '12345678'});
    await test.test_case({method: 'delete-account', username: 'test', password: '1234'});
    await test.test_case({method: 'delete-account', username: 'test', password: '12345678'});
    console.log("Excecuted delete account tests");
}