import {AI_MIG_TASK_ENRICH_STRUCTURE, AI_MIG_TASK_EXTRACT_STRUCTURE} from '../config.js';

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

const extractStructureFromSnippetAITask = function(baseUrl, token, html, meta, existingStructures) {

    return fetch(baseUrl + '/o/ai-tasks/v1.0/generate/' + AI_MIG_TASK_EXTRACT_STRUCTURE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            input: {
                html: html,
                meta: meta,
                existingStructures: existingStructures
            }
        })
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('Success:', data);
        return data;
    })

}

const enrichStructureFromSnippetAITask = function(baseUrl, token, html, meta, existingStructures) {

    return fetch(baseUrl + '/o/ai-tasks/v1.0/generate/' + AI_MIG_TASK_ENRICH_STRUCTURE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            input: {
                html: html,
                meta: meta,
                existingStructures: existingStructures
            }
        })
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('Success:', data);
        return data;
    })

}

export { fetchToken, extractStructureFromSnippetAITask, enrichStructureFromSnippetAITask };
