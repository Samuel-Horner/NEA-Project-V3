import requests
import concurrent.futures
import time
import json

address = "http://localhost:8080"

def get(page):
    return requests.get(address + page).status_code

def req(js):
    return requests.post(address, json = js).json()

def test(iters):
    total_time = 0
    for i in range(0, iters):
        current_time = time.time() * 1000
        req({"method": 'log-in', "username": 'test', "password": '12345678'})
        get("/editor.html")
        req({"method": 'save-project', "username": 'test', "password": '12345678', "project_name": 'test-project', "project_content": ['abc', 'abc', 'abc', 'abc'], "projectID": ''})
        total_time += time.time() * 1000 - current_time
    return total_time / iters

if __name__ == "__main__":
    req({"method": 'create-account', "username": 'test', "password": '12345678'}) # Creates test account

    thread_count = 64
    total_avg_time = 0

    threads = range(0, thread_count)
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for i in threads:
            futures.append(executor.submit(test, iters = 10))
        for future in concurrent.futures.as_completed(futures):
            total_avg_time += future.result()
    
    print(f"Average latency: {total_avg_time / thread_count} ms")

    req({"method": 'delete-account', "username": 'test', "password": '12345678'}) # Deletes test account
