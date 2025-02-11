# How to

Sorry, this is not super clean for the moment.

## Prepare Liferay

You will have to add an OSGi module with this component: https://gist.github.com/fabian-bouche-liferay/2bf410a09e8b167b3c87dc98f6f55162
The Chrome extension creates objects and has to push data against them.
This component will add new scopes to the client whenever a new object is created.

Create an Object Folder with the following External Reference Code: `AI_MIGRATION_OBJECT_FOLDER`
Object definitions will be pushed here.

Create a site where you will push data to. Find out its group ID.

Create an Oauth 2.0 client (using the "Other" Client profile) for
the chrome extension (with only client credentials). Give it full Object Admin scopes.

## Update config.js

Update your OpenAI API Key in config.js
Update the site group ID where object entries will be created as well.

## Build and deploy the chrome extension

`yarn run build`

In chrome, visit chrome://extensions and load the extension from the generated distribution.

## Cleaning up

The chrome extension uses Local Storage to persist data.
It has to be in sync with object definitions and entries loaded in Liferay.
Clean them up on both sides if you need to start again.
