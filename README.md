# 🧩 AI Migration Extension – Setup Guide

This guide explains how to deploy the Liferay OSGi module, configure the required Objects and OAuth 2.0 client, and set up the Chrome extension.

---

## 1) Deploy the OSGi Module

**Jar path (in this repo):**

```
liferay-dependencies/com.liferay.samples.fbo.oauth.extension-1.0.0.jar
```

**How to deploy:**

1. Copy the `.jar` file to your Liferay bundle’s `deploy` folder:
   ```
   bundles/deploy
   ```
2. Liferay will auto-deploy the module. Check your application server logs to confirm the deployment.

---

## 2) Create an Object Folder

**Path in Liferay:**

```
Control Panel → Objects
```

**Steps:**

1. Click the **“+”** button to create a new folder.
2. Set:
   - **Label:** `Ai-Migration`
   - **Name:** `AiMigration`
3. Click **Create Folder**.
4. Open the new folder `Ai-Migration`.
5. Click the **three dots (⋮)** → **Edit label and ERC**.
6. Set **External Reference Code (ERC)** to:
   ```
   AI_MIGRATION_OBJECT_FOLDER
   ```
7. Click **Save**.

---

## 3) Create an OAuth 2.0 Client

**Path in Liferay:**

```
Control Panel → OAuth 2 Administration → New
```

**Configuration:**

- **Name:** `Ai-Migration`
- **Callback URIs:** `http://localhost:8080/`
- **Client Authentication Method:** `Client Secret Basic` or `Post`
- **Client Profile:** `Other`
- **Allowed Authorization Types:** **Only** `Client Credentials`

**After saving:**

- Under **Client ID**, click **Edit** and set:
  ```
  liferay-ai-migration-client
  ```
- Under **Client Secret**, click **Edit** and set:
  ```
  secret-e2c5cbf5-b93b-f4cb-7b11-85fa1dfd57
  ```
- In the **Scope** tab, enable **all items under `LIFERAY.OBJECT.ADMIN.REST`**.

> ⚠️ If this repository will be public, avoid committing secrets; store them in a secure vault or use environment variables.

---

## 4) Get the Site Group ID

1. Open your site in the **left panel (Site Menu)**.
2. Go to **Configuration → Site Settings → Site Configuration**.
3. Under **Details**, find the **Site ID** (usually a 5‑digit number). This is the **groupId** you’ll use below.

---

## 5) Update the Extension Configuration

Edit the file:

```
src/config.js
```

Set your values:

```js
OPENAI_API_KEY = "<your OpenAI API key>";
BASE_URL = "<your site base URL>";   // e.g., "https://example.com"
SITE_KEY = <your site group ID>;   // e.g., 12345
```

---

## 6) Build the Extension

Install dependencies and build:

```bash
yarn install
yarn build
```

The production files will be generated in the `dist` folder.

---

## 7) Load the Extension in Google Chrome

1. Open in your browser:
   ```
   chrome://extensions/
   ```
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select the **entire `dist` folder**.

---

✅ **Done!** The extension is ready to use.
