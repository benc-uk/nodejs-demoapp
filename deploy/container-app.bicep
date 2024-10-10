// ============================================================================
// Deploy a container app with app container environment and log analytics
// ============================================================================

@description('Name of container app')
param appName string = 'nodejs-demoapp'

@description('Region to deploy into')
param location string = resourceGroup().location

@description('Container image to deploy')
param image string = 'ghcr.io/benc-uk/nodejs-demoapp:latest'

@description('Optional feature: OpenWeather API Key')
param weatherApiKey string = ''

@description('Optional feature: Enable Azure App Insights')
param appInsightsConnString string = ''

@description('Optional feature: Enable todo app with MongoDB')
param todoMongoConnstr string = ''

@description('Optional feature: Enable auth with EntraID, and a client id')
param entraAppId string = ''

// ===== Variables ============================================================

var logWorkspaceName = '${resourceGroup().name}-logs'
var environmentName = '${resourceGroup().name}-environment'

// ===== Modules & Resources ==================================================

resource logWorkspace 'Microsoft.OperationalInsights/workspaces@2020-08-01' = {
  location: location
  name: logWorkspaceName
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource appEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  location: location
  name: environmentName

  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logWorkspace.properties.customerId
        sharedKey: logWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  location: location
  name: appName

  properties: {
    environmentId: appEnv.id

    template: {
      containers: [
        {
          image: image
          name: appName
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'WEATHER_API_KEY'
              value: weatherApiKey
            }
            {
              name: 'APPINSIGHTS_CONNECTION_STRING'
              value: appInsightsConnString
            }
            {
              name: 'TODO_MONGO_CONNSTR'
              value: todoMongoConnstr
            }
            {
              name: 'ENTRA_APP_ID'
              value: entraAppId
            }
          ]
        }
      ]
    }

    configuration: {
      ingress: {
        external: true
        targetPort: 3000
      }
    }
  }
}

// ===== Outputs ==============================================================

output appURL string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
