# Node.js - Sample Web Application

This is a sample Node.js web app using the Express framework and EJS templates.

The app has been designed with cloud native demos & containers in mind, in order to provide a real working application for deployment, something more than "hello-world" but with the minimum of pre-reqs. It is not intended as a complete example of a fully functioning architecture or complex software design.

Typical uses would be deployment to Kubernetes, demos of Docker, CI/CD (build pipelines are provided), deployment to cloud (Azure) monitoring, auto-scaling

The app has several basic pages accessed from the top navigation menu, some of which are only lit up when certain configuration variables are set (see 'Optional Features' below):

- **'Info'** - Will show system & runtime information, and will also display if the app is running from within a Docker container and Kubernetes.
- **'Tools'** - Some tools useful in demos, such a forcing CPU load (for autoscale demos), and error/exception pages for use with App Insights or other monitoring tool.
- **'Monitor'** - Display realtime monitoring data, showing memory usage/total and process CPU load.
- **'Weather'** - (Optional) Gets the location of the client page (with HTML5 Geolocation). The resulting location is used to fetch weather data from the [OpenWeather](https://openweathermap.org/) API
- **'Todo'** - (Optional) This is a small todo/task-list app which uses MongoDB as a database.
- **'User Account'** - (Optional) When configured with Azure AD (application client id) user login button will be enabled, and an user-account details page enabled, which calls the Microsoft Graph API

![](https://img.shields.io/github/last-commit/benc-uk/nodejs-demoapp) ![](https://img.shields.io/github/release-date/benc-uk/nodejs-demoapp) ![](https://img.shields.io/github/v/release/benc-uk/nodejs-demoapp) ![](https://img.shields.io/github/commit-activity/y/benc-uk/nodejs-demoapp)

## Screens

![screen](https://user-images.githubusercontent.com/14982936/55620043-dfe96480-5791-11e9-9746-3b42a3a41e5f.png)
![screen](https://user-images.githubusercontent.com/14982936/55620045-dfe96480-5791-11e9-94f3-6d788ed447c1.png)
![screen](https://user-images.githubusercontent.com/14982936/58764072-d8102b80-855a-11e9-993f-21ef0344d5e0.png)

# 🧑‍💻 Running and Testing Locally

### Pre-reqs

- Be using Linux, WSL or MacOS, with bash, make etc
- [Node.js](https://nodejs.org/en/) - for running locally, linting, running tests etc
- [Docker](https://docs.docker.com/get-docker/) - for running as a container, or building images
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-linux) - for deployment to Azure

Clone the project to any directory where you do development work

```bash
git clone https://github.com/benc-uk/nodejs-demoapp.git
```

### Makefile

A standard GNU Make file is provided to help with running and building locally.

```txt
$ make

help                 💬 This help message
lint                 🔎 Lint & format, will not fix but sets exit code on error
lint-fix             📜 Lint & format, will try to fix errors and modify code
image                🔨 Build container image from Dockerfile
push                 📤 Push container image to registry
run                  🏃 Run locally using Node.js
deploy               🚀 Deploy to Azure Container App
undeploy             💀 Remove from Azure
test                 🚦 Run integration tests, server must be running
test-report          🤡 Tests but with JUnit output, server must be running
clean                🧹 Clean up project
```

Make file variables and default values, pass these in when calling `make`, e.g. `make image IMAGE_REPO=blah/foo`

| Makefile Variable | Default                            |
| ----------------- | ---------------------------------- |
| IMAGE_REG         | ghcr<span>.</span>io               |
| IMAGE_REPO        | benc-uk/nodejs-demoapp             |
| IMAGE_TAG         | latest                             |
| AZURE_RES_GROUP   | demoapps                           |
| AZURE_REGION      | northeurope                        |
| TEST_BASE_URL     | http://<span>localhost</span>:3000 |
| TEST_FILES        | base-tests.http                    |

The web app will be listening on the standard Express port of 3000, but this can be changed by setting the `PORT` environmental variable.

# 📦 Containers

Public container image is [available on GitHub Container Registry](https://github.com/users/benc-uk/packages/container/package/nodejs-demoapp).

Run in a container with:

```bash
docker run --rm -it -p 3000:3000 ghcr.io/benc-uk/nodejs-demoapp:latest
```

Should you want to build your own container, use `make image` and the above variables to customise the name & tag.

## Kubernetes

The app can easily be deployed to Kubernetes using Helm, see [deploy/kubernetes/readme.md](deploy/kubernetes/readme.md) for details

# 🏗️ GitHub Actions CI/CD

A set of GitHub Actions workflows are included for CI / CD. Automated builds for PRs are run in GitHub hosted runners validating the code (linting and tests) and building dev images. When code is merged into main, then automated deployment to AKS is done using Helm.

[![CD Release - AKS](https://github.com/benc-uk/nodejs-demoapp/actions/workflows/cd-release-aks.yaml/badge.svg)](https://github.com/benc-uk/nodejs-demoapp/actions/workflows/cd-release-aks.yaml)

# 🧪 Testing

This project uses a HTTP files located in `src/tests/` that can be used a few different ways, you can install the [VSCode REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) or [httpYac](https://marketplace.visualstudio.com/items?itemName=anweber.vscode-httpyac) allowing you to interactively run requests from VSCode

You can interactively run & send the requests in the `src/tests` file using these extensions, but the main reason to use _httpYac_, is it has a much richer language & the support of assertions which can turn the request files into integration tests too 👌

_httpYac_ has a command line tool for running tests and .http files which forms the basis of the `make test` and `make test-report` makefile targets.

## Running Tests

To run the tests, in one shell session run `make run` and open a second separate shell run `make test`. You can set `TEST_BASE_URL` to point the tests at a different URL, host or port, and set `TEST_FILES` to a glob that matches the files you want to run from the src/tests/ directory.

# 🎂 Optional Features

The app will start up and run with zero configuration, however the following optional features can be enabled with various settings

### Monitoring - Azure Application Insights

Enable this by setting `APPLICATIONINSIGHTS_CONNECTION_STRING`

The app has been instrumented with the Application Insights SDK, it will however need to be configured to point to your App Insights instance/workspace. All requests will be tracked, as well as dependant calls to MongoDB or other APIs (if configured), exceptions & error will also be logged.

[This article](https://docs.microsoft.com/azure/application-insights/app-insights-nodejs) has more information on monitoring Node.js with App Insights

### Weather Details

Enable this by setting `WEATHER_API_KEY`

This will require a API key from OpenWeather, you can [sign up for free and get one here](https://openweathermap.org/price). The page uses a browser API for geolocation to fetch the user's location.  
However, the `geolocation.getCurrentPosition()` browser API will only work when the site is served via HTTPS or from localhost. As a fallback, weather for London, UK will be show if the current position can not be obtained

### Authentication with Microsoft Entra ID (was Azure AD)

Enable this by setting `ENTRA_APP_ID`

This uses [Microsoft Authentication Library (MSAL) for Node](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node) to authenticate via MSAL with OIDC and OAuth 2.0. The flow it uses is the "Authorization Code Grant (PKCE)", which means we can sign in users without needing client secrets

When enabled a user account page becomes available in the UI, this shows logged in user details & photo retrieved from the Microsoft Graph API.

You will need to register an app in your Entra ID tenant. The app should be configured for the PKCE flow, if creating the app via the portal select **_Public client/native (mobile & desktop)_** (ignore the fact this doesn't seem the right option for a web app)

When configuring authentication the redirect URL will be the host where the app is running with `/signin` as the URL path, e.g. `https://myapp.azurewebsites.net/signin`, for local testing use `http://localhost:3000/signin`

For the sign-in audience (also called account types) select **_Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)_**

To simplify the registration, the Azure CLI can be used with the following bash snippet:

```bash
baseUrl="http://localhost:3000"
name="NodeJS Demo"
# Create app registration and get client ID
clientId=$(az ad app create \
--public-client-redirect-uris "$baseUrl/signin" \
--display-name "$name" \
--sign-in-audience AzureADandPersonalMicrosoftAccount \
--query appId -o tsv)
# Create a service principal for the application
az ad sp create --id $clientId -o json
echo -e "\n### Set env var ENTRA_APP_ID to '$clientId'"
```

### Todo App

Enable this by setting `TODO_MONGO_CONNSTR`

A mini todo & task tracking app can be enabled if a MongoDB backend is provided and a connection string to access it. This feature is primarily to show database dependency detection and tracking in App Insights

The default database name is `todoDb` but you can change this by setting `TODO_MONGO_DB`

When working locally and if you have Docker, you can easily run MongoDB with `docker run --network host mongo`  
You can also use Azure Cosmos DB (using the Mongo API). Note. When using Cosmos DB and the _per database provisioned RU/s_ option, you must manually create the collection called `todos` in the relevant database and set the shard key to `_id`

# 🛠️ Configuration

The following configuration environmental variables are supported, however none are mandatory. These can be set directly or when running locally will be picked up from an `.env` file if it is present. A sample `.env` file called `.env.sample` is provided for you to copy

If running in an Azure Web App or Azure Container App, all of these values can be injected as application settings in Azure.

| Environmental Variable                | Default | Description                                                                      |
| ------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| PORT                                  | 3000    | Port the server will listen on                                                   |
| TODO_MONGO_CONNSTR                    | _none_  | Connect to specified MongoDB instance, when set the todo feature will be enabled |
| TODO_MONGO_DB                         | todoDb  | Name of the database in MongoDB to use (optional)                                |
| APPLICATIONINSIGHTS_CONNECTION_STRING | _none_  | Enable Azure Application Insights monitoring                                     |
| WEATHER_API_KEY                       | _none_  | OpenWeather API key. [Info here](https://openweathermap.org/api)                 |
| ENTRA_APP_ID                          | _none_  | Client ID of app registered in Microsoft Entra                                   |
| DISABLE_METRICS                       | _none_  | Set to truthy value if you want to switch off Prometheus metrics                 |
| REDIS_SESSION_HOST                    | _none_  | Point to a Redis host to hold/persist session cache                              |

## Deployment

See [deployment folder](./deploy) for deploying into Kubernetes with Helm or into Azure with Bicep and Container Apps.

# 📆 Updates

- Oct 2024 - Major package refresh & compatibility updates
- Oct 2022 - Update App Insights, track custom events
- Sept 2022 - Add Prometheus metrics
- Aug 2022 - Switch to PKCE for auth & login flow
- Nov 2021 - Replace DarkSky API with OpenWeather
- Mar 2021 - Refresh packages and added make + bicep
- Nov 2020 - Switched to MSAL-Node library for authentication
- Oct 2020 - Added GitHub Actions pipelines and Bicep IaC
- Jan 2020 - Added monitor page and API
- Jun 2019 - Added Azure AD login and profile page, cleaned up Todo app MongoDB code
- Apr 2019 - Updated to latest App Insights SDK package, and moved to Bootstrap 4
- Dec 2018 - Modified weather to use client browser location, rather than use IP
- Jul 2018 - Switched todo app over to MongoDB, fixed weather
- Feb 2018 - Updated App Insights monitoring
- Nov 2017 - Update to use Node 8.9
- Oct 2017 - Updated App Insights, improved Dockerfile
- Sept 2017 - Added weather page
- Sept 2017 - Major revamp. Switched to EJS, added Bootstrap and App Insights
- Aug 2017 - Minor changes and fixes for CRLF stuff
- July 2017 - Updated Dockerfile to use super tiny Alpine Node 6 image
- June 2017 - Moved repo to Github
