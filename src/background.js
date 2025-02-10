chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "REQUEST_SELECT_ELEMENT") {
        console.log("REQUEST_SELECT_ELEMENT");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, { 
                type: "GET_SELECT_ELEMENT",
                structures: message.structures
            }, (response) => {
                sendResponse(response);
            });
        });
        return true;     
    } else if (message.type === "REQUEST_MORE_INFO") {
        console.log("REQUEST_MORE_INFO");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, { 
                type: "GET_MORE_INFO",
                structure: message.structure,
                externalReferenceCode: message.externalReferenceCode, 
                url: message.url
            }, (response) => {
                sendResponse(response);
            });
        });
        return true;            
    } else if (message.type === "SEND_EXTRACTED_RECORDS") {
        console.log("SEND_EXTRACTED_RECORDS");
        chrome.runtime.sendMessage({
            type: 'RETURN_EXTRACTED_RECORDS',
            structure: message.structure,
        });
        return true;        
    } else if (message.type === "SEND_ENRICHED_RECORD") {
        console.log("SEND_ENRICHED_RECORD");
        chrome.runtime.sendMessage({
            type: 'RETURN_ENRICHED_RECORD',
            structure: message.structure,
        });
        return true;        
    }
});
