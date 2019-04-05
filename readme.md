# Node.js - Demo Web Application
This is a simple Node.js web app using the Express framework and EJS templates. It has been designed with cloud demos & containers in mind, to demonstrate capabilities such as auto scaling in Azure and Application Insights monitoring

Based on the standard express-generator template with EJS views e.g. `express --git --view=ejs` but has been enhanced with Bootstrap, FontAwesome and App Insights.

The app has four basic pages accessed from the top navigation menu:
 - **INFO** - Will show some system & runtime information, and will also display if the app is running from within a Docker container.  
 - **TOOLS** - Some tools useful in demos, such a forcing CPU load (for autoscale demos), and error pages for use with App Insights
 - **WEATHER** - Gets the location of the client page (with HTML5 Geolocation). The resulting location is used to fetch a weather forecast from the [Dark Sky](http://darksky.net) weather API. The results are show using animated [Skycons](https://darkskyapp.github.io/skycons/). The has the added bonus of allowing you to see dependency calls (out to external APIs) when monitored by App Insights. Dark Sky API key needs to be provided, see configuration below
 - **TODO** - This is a small todo/task-list app which uses MongoDB as a database. Enable this when demo'ing App Insights to show a more complete and real application. *Note.* this view only appears when `MONGO_CONNSTR` is configured, see configuration below
 
![screen](https://user-images.githubusercontent.com/14982936/55620041-dfe96480-5791-11e9-8b78-8ff73ec0f239.png)
![screen](https://user-images.githubusercontent.com/14982936/55620043-dfe96480-5791-11e9-9746-3b42a3a41e5f.png)
![screen](https://user-images.githubusercontent.com/14982936/55620045-dfe96480-5791-11e9-94f3-6d788ed447c1.png)


## Running 
Standard `npm install` and start with `npm start`. Web app will be listening on the usual Express port of 3000, or whatever is set in the `PORT` environmental variable. Tested with Node v8.x and 10.x


## Configuration 
The following configuration environmental variables are used. These can be set directly or will be picked up from an `.env` file if it is present.

|Name|Default|Description                   |
|----|-------|------------------------------|
|PORT|3000   |Port the server will listen on|
|MONGO_CONNSTR|*none*   |Connect to specified MongoDB connection string, when set the Todo feature will be enabled in the menu bar|
|APPINSIGHTS_INSTRUMENTATIONKEY|*none*    |Enable Application Insights monitoring|
|WEATHER_API_KEY|*none*    |DarkSky weather API key. [Info here](https://darksky.net/dev)|


## Docker 
Public Docker image is [available on Dockerhub](https://hub.docker.com/r/bencuk/nodejs-demoapp/).  
Note. The Docker image includes SSH support, this is to enable the web console feature when running this app as a container in Azure Web App for Containers.  

Run with 
```
docker run -d -p 3000:3000 bencuk/nodejs-demoapp`
```

## CI/CD Azure Pipelines 
A working `azure-pipelines.yml` build pipeline is provided, automated builds are run from the public Azure DevOps project

### [DemoApps Project on Azure DevOps](https://dev.azure.com/bencoleman/DemoApps)

### Build Status
[![Build Status](https://dev.azure.com/bencoleman/DemoApps/_apis/build/status/Build%20nodejs-demoapp?branchName=master)](https://dev.azure.com/bencoleman/DemoApps/_build/latest?definitionId=67&branchName=master)


## Application Insights 
The app has been instrumented with the Application Insights SDK, it will however need to be configured to point to your App Insights instance/workspace.  
To configure this, set the `APPINSIGHTS_INSTRUMENTATIONKEY` environmental variable to the relevant key for your active instance. If running in an Azure Web App, this can be set as an application setting in Azure.

[This article](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-nodejs) has more information on monitoring App Insights with Node.js 

## Azure Templates
Templates for deployment to Azure with "quick deploy" buttons are [here](azure-deploy/)

## Updates
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

