import axios from 'axios';

import {OPENAI_MODEL, OPENAI_API_KEY, OPENAI_ENDPOINT} from '../config.js';

const extractStructureFromSnippet = async function(html, meta, existingStructures) {

    const prompt = `
        Analyze the following html snippet extracted from a web page.
        
        You should identify whether it contains a single element or a collection of elements.
        Once you have identified the structured content type, you will provide a description,
        the best fitting schema.org type.

        The structured content types should be mutually exclusive.
                
        Your response should strictly consist of a JSON message describing the structure, its
        fields as well as ALL the records which have been found (make sure they are all included).
        
        In case the structure is already known, then you should reuse it and you will copy the existing structure's
        data, you have the permission to add new fields but don't touch the existing ones.

        It should strictly comply to
        the format of this example where the records have attributes matching the field names:
        {
            "label": "News Article",
            "pluralLabel": "News Articles",
            "name": "NewsArticle",
            "schemaOrgType": "NewsArticle",
            "description": "Latest information",
            "primaryKey": "articleTitle,content",
            "titleFieldName": "articleTitle",
            "new": false,
            "fields": [
                {
                    "name": "articleTitle",
                    "label": "Article title",
                    "schemaOrgType": "headline",
                    "type": "text",
                    "new": false
                }, {
                    "name": "content",
                    "label": "Content",
                    "schemaOrgType": "articleBody",
                    "type": "rich-text",
                    "new": false
                }, {
                    "name": "illustration",
                    "label": "Illustration",
                    "schemaOrgType": "thumbnailUrl",
                    "type": "url",
                    "new": true
                }, {
                    "name": "moreInfoUrl",
                    "label": "More Info",
                    "schemaOrgType": "url",
                    "type": "url",
                    "new": true
                }
            ],
            "records": [
                {
                    "articleTitle": "Robert wins the game",
                    "content": "<h1>A great achievement</h1><p>After blah blah...</p>",
                    "illustration": "https://some.site/some-picture.jpg",
                    "moreInfoUrl": "https://some.site/robert-wins"
                },
                {
                    "articleTitle": "End of the competition",
                    "content": "<h1>Rankings</h1><table>...</table>",
                    "illustration": "https://some.site/some-other-picture.jpg"
                    "moreInfoUrl": "https://some.site/end-competition"
                }
            ]
        }

        The type of a field must be one (defaulting to non-localizable-text):
         - text
         - non-localizable-text
         - rich-text
         - integer
         - decimal
         - url
         - date
         - date-time

        Identifiers or names are probably going to be non-localizable-text.
        
        date-time fields should have the following format: 2025-01-24T23:30:01.346Z

        The mandatory primaryKey must be set to the name of one or more (comma-separated) field(s)
        which is going to be used to deduplicate records.

        The "new" attribute of the new structure indicates whether the structure is new (true) or if
        its updating an existing one (false).
         - If the snippet you have analyzed does not match any existing structure, set it to true
         - Otherwise set it to false

        The "new" attribute of fields indicate whether the field was added or not to the
        structure if an existing structure has been updated.

        Among the fields, you have to select one to bear the title of the content whose name has to be
        written in titleFieldName (it has to be the name of a field that exists).

        For each record, if it has a link to the URL of the entity associated to the record 
        (eg. a product URL, a data sheet URL...) then the field should be named "moreInfoUrl".

        Here are the structures we have already identified with a sample record:
        ${existingStructures}

        HTML content to analyze:
        ${html}

        And meta info from the HTML page to help understand the context:
        ${meta}
    `;

    try {
        const response = await axios.post(OPENAI_ENDPOINT, {
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful assistant skilled in extracting structured contents from an html document.' },
                { role: 'user', content: prompt }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Extract and return the structures from the response
        return response.data.choices[0].message.content.trim()
            .replace(/```json\n/, '')
            .replace(/\n```/, '');
      ;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return 'Error extracting structures';
    }

}

const enrichStructureFromSnippet = async function(html, meta, existingStructure) {

    const prompt = `
        Analyze the following html snippet extracted from a web page.

        It should be used to enrich the following known structure:
        ${existingStructure}
        
        Your response should strictly consist of a JSON message describing the structure, its
        fields and the updated record from the input with all the additional fields you have
        found.
        
        You will reuse the already known structure and keep all the existing fields without
        touching them, while adding any new field you have identified in the snippet.
        
        It should strictly comply to
        the format of this example where the records have attributes matching the field names:
        {
            "label": "News Article",
            "pluralLabel": "News Articles",
            "name": "NewsArticle",
            "schemaOrgType": "NewsArticle",
            "description": "Latest information",
            "primaryKey": "articleTitle,content",
            "titleFieldName": "articleTitle",
            "new": false,
            "fields": [
                {
                    "name": "articleTitle",
                    "label": "Article title",
                    "schemaOrgType": "headline",
                    "type": "text",
                    "new": false
                }, {
                    "name": "content",
                    "label": "Content",
                    "schemaOrgType": "articleBody",
                    "type": "rich-text"
                    "new": false
                }, {
                    "name": "illustration",
                    "label": "Illustration",
                    "schemaOrgType": "thumbnailUrl",
                    "type": "url"
                    "new": true
                }
            ],
            "records": [
                {
                    "externalReferenceCode": "126979a2-d3b0-9161-34e8-3078d85eedb6",
                    "articleTitle": "Robert wins the game",
                    "content": "<h1>A great achievement</h1><p>After blah blah...</p>",
                    "illustration": "https://some.site/some-picture.jpg"
                }
            ]
        }

        The type of a field must be one (defaulting to non-localizable-text):
         - text
         - non-localizable-text
         - rich-text
         - integer
         - decimal
         - url
         - date
         - date-time

        date-time fields should have the following format: 2025-01-24T23:30:01.346Z

        Identifiers or names are probably going to be non-localizable-text.

        The mandatory primaryKey must be set to the name of one or more (comma-separated) field(s)
        which is going to be used to deduplicate records.

        The "new" attribute with the value false indicates that the structure updates an existing one.

        The "new" attribute of fields indicate whether the field was added or not to the
        structure.

        Among the fields, you have to select one to bear the title of the content whose name has to be
        written in titleFieldName.

        HTML content to analyze:
        ${html}

        And meta info from the HTML page to help understand the context:
        ${meta}
    `;

    try {
        const response = await axios.post(OPENAI_ENDPOINT, {
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful assistant skilled in extracting structured contents from an html document.' },
                { role: 'user', content: prompt }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Extract and return the structures from the response
        return response.data.choices[0].message.content.trim()
            .replace(/```json\n/, '')
            .replace(/\n```/, '');
      ;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return 'Error extracting structures';
    }

}

export {extractStructureFromSnippet, enrichStructureFromSnippet};