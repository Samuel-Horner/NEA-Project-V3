#!/bin/zsh
echo "http_tests: "
node http_tests.js
echo "-------"
echo "load_project: "
node load_project.js
echo "-------"
echo "create_account: "
node create_account.js
echo "-------"
echo "delete_account: "
node delete_account.js
echo "-------"
echo "log_in: "
node log_in.js
echo "-------"
echo "get_projects: "
node get_projects.js
echo "-------"
echo "save_project: "
node save_project.js
echo "-------"
echo "delete_project: "
node delete_project.js
echo "-------"
