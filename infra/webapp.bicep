param location string = resourceGroup().location

param planName string = 'app-plan-linux'
param planTier string = 'P1v2'

param webappName string = 'nodejs-demoapp'
param webappImage string = 'ghcr.io/benc-uk/nodejs-demoapp:latest'
param weatherKey string = ''
param releaseInfo string = 'Released on ${utcNow('f')}'
param aadBaseUrl string = 'https://${webappName}.azurewebsites.net'
param aadAppId string = ''
param aadAppSecret string {
  secure: true
  default: ''
}

resource appServicePlan 'Microsoft.Web/serverFarms@2020-06-01' = {
  name: planName
  location: location
  kind: 'linux'
  sku: {
    name: planTier
  }
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2018-11-01' = {
  name: webappName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      appSettings:[
        {
          name: 'WEATHER_API_KEY'
          value: weatherKey
        }
        {
          name: 'RELEASE_INFO'
          value: releaseInfo
        }
        {
          name: 'AAD_APP_ID'
          value: aadAppId
        }
        {
          name: 'AAD_APP_SECRET'
          value: aadAppSecret
        }
        {
          name: 'AAD_REDIRECT_URL_BASE'
          value: aadBaseUrl
        }                       
      ]
      linuxFxVersion: 'DOCKER|${webappImage}'
    }
  }
}