async function req(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'omit',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(data),
    });
    if (response.ok){
        return response.json();
    }
}