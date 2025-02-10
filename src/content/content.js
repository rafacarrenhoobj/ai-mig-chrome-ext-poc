import { fetchToken, extractStructureFromSnippetAITask, enrichStructureFromSnippetAITask } from './chat-apis.js';
import { createModal, showModal, closeModal } from './modal.js'

import { extractStructureFromSnippet, enrichStructureFromSnippet } from './openai-prompts.js'

import {USE_OPENAI, BASE_URL, CLIENT_ID, CLIENT_SECRET} from '../config.js';

console.log("Injected Liferay AI Migration Javascript!");

const pageTitle = document.title;

createModal(document);

let isSelecting = false;
let lastHighlightedElement = null;

///////////////////////

function highlightElement(event, root = document) {
    if (!isSelecting) return;

    // Use the root to find the element at the pointer location
    const element = root.elementFromPoint(event.clientX, event.clientY);

    // If an element was previously highlighted, reset its style
    if (lastHighlightedElement && lastHighlightedElement !== element) {
        lastHighlightedElement.style.outline = '';
    }

    // Highlight the new element if it's different from the last one
    if (element && element !== lastHighlightedElement) {
        element.style.outline = '2px solid red'; // Add the highlight
        lastHighlightedElement = element; // Remember the current element
    }
}

// Function to extract meta information
function extractMetaInfo() {
    const metaInfo = {
        title: document.title || null,
        description: null,
        openGraph: {},
    };
  
    // Extract meta description
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
        metaInfo.description = descriptionTag.getAttribute('content');
    }
  
    // Extract Open Graph meta tags
    const ogTags = document.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach(tag => {
        const property = tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (property && content) {
            metaInfo.openGraph[property] = content;
        }
    });
  
    return metaInfo;
}

async function selectElement(event) {
    if (!isSelecting) return;

    event.preventDefault();
    isSelecting = false;

    const selectedElement = document.elementFromPoint(event.clientX, event.clientY);
    if (selectedElement) {
        const existingStructures = localStorage.getItem("LIFERAY_STRUCTURES");

        showModal(document, "Analyzing structure");

        let extractedStructure;

        if(USE_OPENAI) {
            extractedStructure = await extractStructureFromSnippet(selectedElement.outerHTML, JSON.stringify(extractMetaInfo()), existingStructures);
        } else {
            extractedStructure = await extractStructureFromSnippetBis(selectedElement.outerHTML, JSON.stringify(extractMetaInfo()), existingStructures);
        }

        closeModal(document);

        chrome.runtime.sendMessage({
            type: 'SEND_EXTRACTED_RECORDS',
            structure: extractedStructure
        });

        selectedElement.style.outline = '';

    }

    document.body.style.cursor = '';
    document.removeEventListener('mousemove', highlightElement);
    document.removeEventListener('click', selectElement);
}

async function enrichElement(event, root, modal) {
    if (!isSelecting) return;

    event.preventDefault();
    isSelecting = false;

    const selectedElement = root.elementFromPoint(event.clientX, event.clientY);
    if (selectedElement) {
        const existingStructure = localStorage.getItem("LIFERAY_CURRENT_STRUCTURE");

        showModal(root, "Analyzing structure");

        let extractedStructure;
        
        if(USE_OPENAI) {
            extractedStructure = await enrichStructureFromSnippet(selectedElement.outerHTML, JSON.stringify(extractMetaInfo()), existingStructure);
        } else {
            extractedStructure = await enrichStructureFromSnippetBis(selectedElement.outerHTML, JSON.stringify(extractMetaInfo()), existingStructure);
        }

        closeModal(root);

        chrome.runtime.sendMessage({
            type: 'SEND_ENRICHED_RECORD',
            structure: extractedStructure
        });

        selectedElement.style.outline = '';
    }

    document.body.removeChild(modal);
    root.body.style.cursor = '';
    root.removeEventListener('mousemove', highlightElement);
    root.removeEventListener('click', enrichElement);
}

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_SELECT_ELEMENT') {
        (async () => {
            try {
                isSelecting = true;
                document.body.style.cursor = 'crosshair';

                localStorage.setItem("LIFERAY_STRUCTURES", JSON.stringify(message.structures));

                document.addEventListener('mousemove', highlightElement);
                document.addEventListener('click', selectElement);
                sendResponse({
                    action: "selecting"
                });
            } catch (error) {
                console.error('Error processing the request:', error);
                sendResponse({ error: 'An error occurred during processing.' });
            }
        })();
    } else if (message.type === 'GET_MORE_INFO') {
        (async () => {
            try {
                isSelecting = true;
    
                localStorage.setItem("LIFERAY_CURRENT_STRUCTURE", JSON.stringify(message.structure));
    
                // Create a modal
                const modal = document.createElement('div');
                modal.style.position = 'fixed';
                modal.style.top = '50%';
                modal.style.left = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
                modal.style.width = '90%';
                modal.style.height = '90%';
                modal.style.backgroundColor = '#fff';
                modal.style.padding = '20px';
                modal.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
                modal.style.zIndex = 10000;
                modal.style.display = 'flex';
                modal.style.flexDirection = 'column';
    
                // Create the iframe
                const iframe = document.createElement('iframe');
                iframe.src = message.url;
                iframe.style.flex = '1'; // Take all remaining space in the modal
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
    
                // Inject crosshair and event listeners into the iframe
                iframe.onload = () => {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
                    iframeDoc.body.style.cursor = 'crosshair';

                    createModal(iframeDoc);
    
                    iframeDoc.addEventListener('mousemove', (event) => highlightElement(event, iframeDoc));
                    iframeDoc.addEventListener('click', (event) => enrichElement(event, iframeDoc, modal));
                };
    
                // Create the close button
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.style.marginTop = '10px';
                closeButton.style.alignSelf = 'flex-end';
                closeButton.onclick = () => {
                    document.body.removeChild(modal);
                    document.body.style.cursor = 'default';
                    isSelecting = false;
                };
    
                // Append iframe and button to the modal
                modal.appendChild(iframe);
                modal.appendChild(closeButton);
    
                // Append the modal to the document body
                document.body.appendChild(modal);
    
                sendResponse({ action: "modal_opened" });
            } catch (error) {
                console.error('Error processing the request:', error);
                sendResponse({ error: 'An error occurred during processing.' });
            }
        })();
    }
});

async function extractStructureFromSnippetBis(html, meta, existingStructures) {

    const token = await fetchToken(BASE_URL, CLIENT_ID, CLIENT_SECRET);
    const response = await extractStructureFromSnippetAITask(BASE_URL, token, html, meta, existingStructures);

    return response.output.text.trim()
        .replace(/```json\n/, '')
        .replace(/\n```/, '');

}

async function enrichStructureFromSnippetBis(html, meta, existingStructures) {

    const token = await fetchToken(BASE_URL, CLIENT_ID, CLIENT_SECRET);
    const response = await enrichStructureFromSnippetAITask(BASE_URL, token, html, meta, existingStructures);

    return response.output.text.trim()
        .replace(/```json\n/, '')
        .replace(/\n```/, '');

}