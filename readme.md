# Node.js - Demo Web Application
This is a simple Node.js web app using the Express framework and EJS templates. It has been designed with cloud demos & containers in mind, to demonstrate capabilities such as auto scaling in Azure, Application Insights monitoring and use of Azure AD for authentication


The app has five basic pages accessed from the top navigation menu, three of which are only lit up when certain configuration variables are set (see 'Optional Features' below):
 - **INFO** - Will show some system & runtime information, and will also display if the app is running from within a Docker container and Kubernetes.  
 - **TOOLS** - Some tools useful in demos, such a forcing CPU load (for autoscale demos), and error pages for use with App Insights
 - **WEATHER** - Gets the location of the client page (with HTML5 Geolocation). The resulting location is used to fetch a weather forecast from the [Dark Sky](http://darksky.net) weather API
 - **TODO** - This is a small todo/task-list app which uses MongoDB as a database.
 - **LOGIN** - When configured with details of an app registered in Azure AD  (id and secret) user login button will be enabled.

<!-- ![screen](https://user-images.githubusercontent.com/14982936/55620041-dfe96480-5791-11e9-8b78-8ff73ec0f239.png) -->
![screen](https://user-images.githubusercontent.com/14982936/55620043-dfe96480-5791-11e9-9746-3b42a3a41e5f.png)
![screen](https://user-images.githubusercontent.com/14982936/55620045-dfe96480-5791-11e9-94f3-6d788ed447c1.png)
![screen](https://user-images.githubusercontent.com/14982936/58764072-d8102b80-855a-11e9-993f-21ef0344d5e0.png)


# Running Locally 
Standard Node.js `npm install` and start with `npm start`. Web app will be listening on the usual Express port of 3000, but this can be changed by setting the `PORT` environmental variable. Tested with Node v8.x and 10.x


# Docker 
Public Docker image is [available on Dockerhub](https://hub.docker.com/r/bencuk/nodejs-demoapp/).  

Run in a container with:
```
docker run -d -p 3000:3000 bencuk/nodejs-demoapp`
```

Should you want to build your own container, use the `Dockerfile` at the root of the project

# CI/CD Azure Pipelines 
A working `azure-pipelines.yml` build pipeline is provided, automated builds are run from the public Azure DevOps project

### [DemoApps Project on Azure DevOps](https://dev.azure.com/bencoleman/DemoApps)

### Build Status
[![Build Status](https://dev.azure.com/bencoleman/DemoApps/_apis/build/status/Build%20nodejs-demoapp?branchName=master)](https://dev.azure.com/bencoleman/DemoApps/_build/latest?definitionId=67&branchName=master)


# Optional Features
The app will start up and run with zero configuration, however the only features that will be available will be the INFO and TOOLS views. The following optional features can be enabled:

### Application Insights 
Enable this by setting `APPINSIGHTS_INSTRUMENTATIONKEY` 

The app has been instrumented with the Application Insights SDK, it will however need to be configured to point to your App Insights instance/workspace. All requests will be tracked, as well as dependant calls to MongoDB or other APIs (if configured), exceptions & error will also be logged

[This article](https://docs.microsoft.com/azure/application-insights/app-insights-nodejs) has more information on monitoring Node.js with App Insights

### Weather Details
Enable this by setting `WEATHER_API_KEY`

This will require a API key from Dark Sky, you can [sign up for free and get one here](https://darksky.net/dev). The page uses a browser API for geolocation to fetch the user's location.  
However, the `geolocation.getCurrentPosition()` browser API will only work when the site is served via HTTPS or from localhost. As a fallback, weather for London, UK will be show if the current position can not be obtained

### User Authentication with Azure AD
Enable this by setting `AAD_APP_ID`, `AAD_APP_SECRET` and `AAD_REDIRECT_URL_BASE`

This uses [Passport.js and the Azure AD plug-in](https://github.com/AzureAD/passport-azure-ad) to authenticate via OIDC. In addition the user account page shows details & photo retrieved from the Microsoft Graph API

You will need to register an app in your Azure AD tennant. [See this guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app). Make sure you enable the options for "Access Tokens" and "ID Tokens" in the Authentication settings. Add a secret to your app and use the app's ID & secret value in `AAD_APP_ID` & `AAD_APP_SECRET`

`AAD_REDIRECT_URL_BASE` should be the base URL of where your app is running, e.g. `http://localhost:3000` or `https://example.com`. It should start with `http://` or `https://`. This is used by the login flow to redirect back to the app, the path `/auth/openid/return` will be appended to this value to form the complete redirect URL

### Todo App
Enable this by setting `TODO_MONGO_CONNSTR`

A mini todo & task tracking app can be enabled if a MongoDB backend is provided and a connection string to access it. This feature is primarily to show database dependency detection and tracking in App Insights

The default database name is `todoDb` but you can change this by setting `TODO_MONGO_DB`

You can stand up MongoDB in a container instance or in Cosmos DB (using the Mongo API). Note. When using Cosmos DB and the *per database provisioned RU/s* option, you must manually create the collection called `todos` in the relevant database and set the shard key to `_id`

# Configuration 
The following configuration environmental variables are supported, however none are mandatory. These can be set directly or when running locally will be picked up from an `.env` file if it is present. A sample `.env` file called `.env.sample` is provided for you to copy 

If running in an Azure Web App, all of these values can be injected as application settings in Azure.

|Environmental Variable|Default|Description                   |
|----|-------|------------------------------|
|PORT| 3000  |Port the server will listen on|
|TODO_MONGO_CONNSTR|  *none*  |Connect to specified MongoDB instance, when set the Todo feature will be enabled in the menu bar|
|TODO_MONGO_DB|  todoDb  |Name of the database in MongoDB to use (optional)|
|APPINSIGHTS_INSTRUMENTATIONKEY|  *none*  |Enable Application Insights monitoring|
|WEATHER_API_KEY| *none* |DarkSky weather API key. [Info here](https://darksky.net/dev)|
|AAD_APP_ID| *none* |Application ID of app registered in Azure AD|
|AAD_APP_SECRET| *none* |Secret / password of app registered in Azure AD|
|AAD_REDIRECT_URL_BASE| *none* |Hostname/domain where app is running|


# Azure Templates
ARM templates for deployment to Azure are provided. To get started quickly you can deploy the app as a Azure Container Instance using [this template](https://github.com/benc-uk/azure-arm/tree/master/container-instances/linux-container), and use `bencuk/nodejs-demoapp` as the image name and `3000` as the port


# Updates
* Jun 2019 - Added Azure AD login and profile page, cleaned up Todo app MongoDB code
* Apr 2019 - Updated to latest App Insights SDK package, and moved to Bootstrap 4
* Dec 2018 - Modified weather to use client browser location, rather than use IP
* Jul 2018 - Switched todo app over to MongoDB, fixed weather
* Feb 2018 - Updated App Insights monitoring
* Nov 2017 - Update to use Node 8.9
* Oct 2017 - Updated App Insights, improved Dockerfile
* Sept 2017 - Added weather page
* Sept 2017 - Major revamp. Switched to EJS, added Bootstrap and App Insights
* Aug 2017 - Minor changes and fixes for CRLF stuff
* July 2017 - Updated Dockerfile to use super tiny Alpine Node 6 image
* June 2017 - Moved repo to Github
