const USE_OPENAI = true;

// Use 'gpt-4o-mini', 'gpt-3.5-turbo' or 'gpt-4' as required
const OPENAI_MODEL = 'gpt-4o-mini'

// Openai endpoint URL
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Openai API Key
const OPENAI_API_KEY = ''; // PUT YOUR KEY HERE

// The Liferay base URL
const BASE_URL = "http://localhost:8080";

// Site group ID where data will be imported
const SITE_KEY = 32950;

// Locale
const LOCALE = "en_US";

// Liferay OAuth 2.0 Client ID and Secret for object admin
const CLIENT_ID = 'liferay-ai-migration-client';
const CLIENT_SECRET = 'secret-e2c5cbf5-b93b-f4cb-7b11-85fa1dfd57';

// Liferay Object Folder External Reference Code
const AI_MIGRATION_OBJECT_FOLDER = "AI_MIGRATION_OBJECT_FOLDER";

// Panel category where objects will be added (site scoped)
const PANEL_CATEGORY = "site_administration.content";

// You need to clean them up in case you reset objects on the liferay side
const OBJECT_DEFINITION_LOCAL_STORAGE_PREFIX = "OBJECT_DEFINITION_STRUCTURE_";

// External Ref Codes of the AI Tasks - only for Gemini
const AI_MIG_TASK_ENRICH_STRUCTURE = "AI_MIG_TASK_ENRICH_STRUCTURE";
const AI_MIG_TASK_EXTRACT_STRUCTURE = "AI_MIG_TASK_EXTRACT_STRUCTURE";

export {BASE_URL, CLIENT_ID, CLIENT_SECRET, OBJECT_DEFINITION_LOCAL_STORAGE_PREFIX,
    SITE_KEY, LOCALE, AI_MIGRATION_OBJECT_FOLDER, PANEL_CATEGORY,
    AI_MIG_TASK_ENRICH_STRUCTURE, AI_MIG_TASK_EXTRACT_STRUCTURE, USE_OPENAI,
    OPENAI_API_KEY, OPENAI_ENDPOINT, OPENAI_MODEL}