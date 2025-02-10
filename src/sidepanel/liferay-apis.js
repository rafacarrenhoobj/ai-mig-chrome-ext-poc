import {AI_MIGRATION_OBJECT_FOLDER, PANEL_CATEGORY} from '../config.js';

const pushRecord = function (baseUrl, token, structure, siteKey, record, locale) {
    // Transform the record to add *_i18n attributes for text or rich-text fields
    const updatedRecord = { ...record };
    delete updatedRecord.moreInfoUrl;

    structure.fields.forEach((field) => {
        if (field.name !== "moreInfoUrl") {
            if (field.type === "text" || field.type === "rich-text") {
                const fieldName = field.name;
                if (record[fieldName]) {
                    updatedRecord[`${fieldName}_i18n`] = { [locale]: record[fieldName] };
                }
            }
        }
    });


    // Send the updated record
    return fetch(baseUrl + structure._restContextPath  + '/scopes/' + siteKey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRecord), // Use the transformed record
    })
    .then((response) => response.json());
};

const updateRecord = function (baseUrl, token, structure, siteKey, record, locale) {

    const updatedRecord = { ...record };
    delete updatedRecord.moreInfoUrl;

    structure.fields.forEach((field) => {
        if (field.name !== "moreInfoUrl") {
            if (field.type === "text" || field.type === "rich-text") {
                const fieldName = field.name;
                if (record[fieldName]) {
                    updatedRecord[`${fieldName}_i18n`] = { [locale]: record[fieldName] };
                }
            }
        }
    });

    return fetch(baseUrl + structure._restContextPath + '/scopes/' + siteKey + '/by-external-reference-code/' + record.externalReferenceCode, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRecord),
    })
    .then((response) => response.json());

}

const createObjectDefinition = function(baseUrl, token, structure) {

    const objectFields = createObjectFields(structure);

    return fetch(baseUrl + '/o/object-admin/v1.0/object-definitions/by-external-reference-code/' + structure.name, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            "accountEntryRestricted": false,
            "active": true,
            "defaultLanguageId": "en_US",
            "enableCategorization": true,
            "enableComments": false,
            "enableIndexSearch": true,
            "enableLocalization": true,
            "enableObjectEntryDraft": false,
            "enableObjectEntryHistory": false,
            "label": {
              "en_US": structure.label
            },
            "modifiable": true,
            "name": structure.name,
            "objectActions": [],
            "objectFields": objectFields,
            "objectFolderExternalReferenceCode": AI_MIGRATION_OBJECT_FOLDER,
            "objectLayouts": [],
            "objectRelationships": [],
            "objectValidationRules": [],
            "objectViews": [],
            "panelCategoryKey": PANEL_CATEGORY,
            "pluralLabel": {
              "en_US": structure.pluralLabel
            },
            "portlet": true,
            "scope": "site",
            "system": false,
            "titleObjectFieldName": structure.titleFieldName
        }),
    })
    .then((response) => response.json())

}

const addFieldToObjectDefinition = (baseUrl, token, structureName, field) => {
    const { dbType, businessType, localized } = getFieldAttributes(field);

    const objectField = {
        DBType: dbType,
        businessType: businessType,
        externalReferenceCode: field.name,
        indexed: true,
        label: {
            en_US: field.label,
        },
        localized: localized,
        name: field.name,
        required: false,
        state: false
    };

    if(businessType === "DateTime") {
        objectField.objectFieldSettings = [
				{
					name: "timeStorage",
				    value: "convertToUTC"
				}
			]
    }

    return fetch(`${baseUrl}/o/object-admin/v1.0/object-definitions/by-external-reference-code/${structureName}/object-fields`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(objectField),
    }).then((response) => response.json());
};

const getObjectDefinitions = function(baseUrl, token) {

    return fetch(baseUrl + '/o/object-admin/v1.0/object-folders/by-external-reference-code/' + AI_MIGRATION_OBJECT_FOLDER, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then((response) => response.json())

}

const publishObjectDefinition = function(baseUrl, token, objectDefinitionId) {

    return fetch(baseUrl + '/o/object-admin/v1.0/object-definitions/' + objectDefinitionId + '/publish', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
    .then((response) => response.json())

}

const getFieldAttributes = (field) => {
    let dbType;
    let businessType;
    let localized;

    switch (field.type) {
        case "text":
            dbType = "String";
            businessType = "Text";
            localized = true;
            break;
        case "non-localizable-text":
            dbType = "String";
            businessType = "Text";
            localized = false;
            break;
        case "rich-text":
            dbType = "Clob";
            businessType = "RichText";
            localized = true;
            break;
        case "date":
            dbType = "Date";
            businessType = "Date";
            localized = false;
            break;
        case "date-time":
            dbType = "DateTime";
            businessType = "DateTime";
            localized = false;
            break;
        case "integer":
            dbType = "Integer";
            businessType = "Integer";
            localized = false;
            break;
        case "decimal":
            dbType = "BigDecimal";
            businessType = "PrecisionDecimal";
            localized = false;
            break;
        case "url":
            dbType = "String";
            businessType = "Text";
            localized = false;
            break;
        default:
            dbType = "String";
            businessType = "Text";
            localized = false;
            break;
    }

    return { dbType, businessType, localized };
};

const createObjectFields = function (structure) {
    const objectFields = [];

    structure.fields.forEach((field) => {
        if (field.name !== "moreInfoUrl") {
            const { dbType, businessType, localized } = getFieldAttributes(field);

            const objectField = {
                DBType: dbType,
                businessType: businessType,
                externalReferenceCode: field.name,
                indexed: true,
                label: {
                    en_US: field.label,
                },
                localized: localized,
                name: field.name,
                required: false,
                state: false
            }

            if(businessType === "DateTime") {
                objectField.objectFieldSettings = [
                        {
                            name: "timeStorage",
                            value: "convertToUTC"
                        }
                    ]
            }

            objectFields.push(objectField);
        }
    });

    return objectFields;
};

export { pushRecord, updateRecord, getObjectDefinitions, createObjectDefinition, publishObjectDefinition, addFieldToObjectDefinition };
