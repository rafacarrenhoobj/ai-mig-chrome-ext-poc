
const fetchToken = function(baseUrl, clientId, clientSecret) {
    return fetch(baseUrl + '/o/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('Success:', data);
        return data.access_token;
    })
    .catch((error) => console.error('Error:', error));
}

export { fetchToken };