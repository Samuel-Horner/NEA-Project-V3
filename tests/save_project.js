const test = require('./global');

run_test();

async function run_test(){
    // Save project tests
    await test.test_case({method: 'create-account', username: 'test', password: '12345678'});
    console.log("Initialised DB");
    await test.test_case({method: 'save-project'});
    await test.test_case({method: 'save-project', username: '', password: '', project_name: '', project_content: [], projectID: ''});
    await test.test_case({method: 'save-project', username: '', password: '', project_name: '', project_content: ['abc', 'abc', 'abc', 'abc'], projectID: ''});
    await test.test_case({method: 'save-project', username: 'test', password: '', project_name: '', project_content: ['abc', 'abc', 'abc', 'abc'], projectID: ''});
    await test.test_case({method: 'save-project', username: '', password: '12345678', project_name: '', project_content: ['abc', 'abc', 'abc', 'abc'], projectID: ''});
    await test.test_case({method: 'save-project', username: 'test', password: '12345678', project_name: '', project_content: ['abc', 'abc', 'abc', 'abc'], projectID: ''});
    await test.test_case({method: 'save-project', username: 'test', password: '12345678', project_name: 'test-project-invalid-content', project_content: 1, projectID: ''}); // Project content not a list
    await test.test_case({method: 'save-project', username: 'test', password: '12345678', project_name: 'test-project', project_content: ['abc', 'abc', 'abc', 'abc'], projectID: ''}); // Valid save project
    await test.test_case({method: 'save-project', username: 'test', password: '12345678', project_name: 'test-project', project_content: ['overwritten!', 'abc', 'abc', 'abc'], projectID: ''}); // Valid save project - overwriting previous save
    console.log("Excecuted save project tests");
    await test.test_case({method: 'delete-project', username: 'test', password: '12345678', projectID: 2});
    await test.test_case({method: 'delete-project', username: 'test', password: '12345678', projectID: 3});
    await test.test_case({method: 'delete-account', username: 'test', password: '12345678'});
    console.log("Cleaned up")
}