const test = require('./global');

run_test();

async function run_test(){
    // Delete project tests
    await test.test_case({method: 'create-account', username: 'test', password: '12345678'});
    console.log("Initialised DB")
    await test.test_case({method: 'delete-project', username: 'test', password: '12345678', projectID: 2});
    await test.test_case({method: 'delete-project', username: 'test', password: '12345678', projectID: 3});
    await test.test_case({method: 'delete-project'});
    await test.test_case({method: 'delete-project', username: '', password: '', projectID: ''});
    await test.test_case({method: 'delete-project', username: 'test', password: '', projectID: ''});
    await test.test_case({method: 'delete-project', username: '', password: '12345678', projectID: ''});
    await test.test_case({method: 'save-project', username: 'test', password: '12345678', project_name: 'test-project', project_content: ['abc', 'abc', 'abc', 'abc'], projectID: '2'});
    await test.test_case({method: 'delete-project', username: '', password: '', projectID: '2'});
    await test.test_case({method: 'delete-project', username: 'test', password: '12345678', projectID: '3'});
    await test.test_case({method: 'delete-project', username: 'test', password: '12345678', projectID: '2'});
    await test.test_case({method: 'delete-project', username: 'test', password: '12345678', projectID: '1'});
    console.log("Excecuted delete project tests");
    await test.test_case({method: 'delete-account', username: 'test', password: '12345678'});
    console.log("Cleaned up")
}