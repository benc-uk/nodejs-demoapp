//
// Routes used by login and account screen
// ---------------------------------------------
// Ben C, Nov 2020 - Updated Aug 2022
//

import express from 'express'
const router = express.Router()
import * as msal from '@azure/msal-node'
import appInsights from 'applicationinsights'

import { getUserDetails, getUserPhoto } from '../graph.mjs'

// For reasons we need to do this here as well
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

const AUTH_SCOPES = ['user.read']
const AUTH_ENDPOINT = 'https://login.microsoftonline.com/common'
const AUTH_CALLBACK_PATH = 'signin'

let msalApp

// Create MSAL public application object, only if ENTRA_APP_ID enabled
if (process.env.ENTRA_APP_ID) {
  msalApp = new msal.PublicClientApplication({
    auth: {
      clientId: process.env.ENTRA_APP_ID,
      authority: AUTH_ENDPOINT,
    },

    system: {
      loggerOptions: {
        loggerCallback(level, msg) {
          if (!msg.includes('redirect?code=')) console.log('### 🕵️‍♀️ MSAL: ', msg)
        },
        piiLoggingEnabled: false,
        logLevel: msal.LogLevel.Warning,
      },
    },
  })

  console.log(`### 🔐 MSAL configured using client ID: ${process.env.ENTRA_APP_ID}`)
}

// ==============================
// Routes
// ==============================

// This login route will redirect to Azure AD start the PKCE auth flow
router.get('/login', async (req, res) => {
  console.log('### 🔐 MSAL login, start PKCE flow...')
  const host = req.get('host')
  const redirectUri = `${host.indexOf('localhost') == 0 ? 'http' : 'https'}://${host}/${AUTH_CALLBACK_PATH}`

  try {
    // Generate PKCE Codes before starting the authorization flow
    const cryptoProvider = new msal.CryptoProvider()
    const { verifier, challenge } = await cryptoProvider.generatePkceCodes()

    // create session object if does not exist
    if (!req.session.pkceCodes) {
      req.session.pkceCodes = {
        challengeMethod: 'S256',
      }
    }

    // Set generated PKCE Codes as session vars
    req.session.pkceCodes.verifier = verifier
    req.session.pkceCodes.challenge = challenge

    // Add PKCE code challenge and challenge method to authCodeUrl request object
    const authCodeUrlParameters = {
      scopes: AUTH_SCOPES,
      redirectUri: redirectUri,
      codeChallenge: req.session.pkceCodes.challenge, // PKCE Code Challenge
      codeChallengeMethod: req.session.pkceCodes.challengeMethod, // PKCE Code Challenge Method
    }

    // Get url to sign user in and consent to scopes needed for application
    const authCodeUrl = await msalApp.getAuthCodeUrl(authCodeUrlParameters)
    if (!authCodeUrl) {
      throw new Error('ERROR! Failed to get auth code url')
    }
    // Redirect user to auth code url to sign in
    res.redirect(authCodeUrl)
  } catch (err) {
    res.render('error', {
      title: 'PKCE redirect error',
      message: err,
      error: err,
    })
  }
})

// This route is called by Azure AD after the user has logged in
// It will exchange the auth code for an access token
router.get(`/${AUTH_CALLBACK_PATH}`, async (req, res) => {
  console.log('### 🔐 MSAL login, code received...')

  const host = req.get('host')
  const redirectUri = `${host.indexOf('localhost') == 0 ? 'http' : 'https'}://${host}/${AUTH_CALLBACK_PATH}`

  // Add PKCE code verifier to token request object
  const tokenRequest = {
    code: req.query.code,
    scopes: AUTH_SCOPES,
    redirectUri: redirectUri,
    codeVerifier: req.session.pkceCodes.verifier, // PKCE Code Verifier
    clientInfo: req.query.client_info,
  }

  try {
    const tokenResponse = await msalApp.acquireTokenByCode(tokenRequest)
    if (!tokenResponse) {
      throw 'ERROR! Failed to acquire token by code'
    }

    // Store user details in session
    req.session.user = {
      account: tokenResponse.account,
      accessToken: tokenResponse.accessToken,
    }

    // Track user login as an App Insights custom event
    if (appInsights && appInsights.defaultClient) {
      appInsights.defaultClient.trackEvent({
        name: 'userLogin',
        properties: {
          user: tokenResponse.account.username,
          tenantId: tokenResponse.account.tenantId,
          userId: tokenResponse.uniqueId,
        },
      })
    }

    res.redirect('/account')
  } catch (err) {
    res.render('error', {
      title: 'MSAL authentication failed',
      message: err,
      error: err,
    })
  }
})

router.get('/logout', function (req, res) {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

router.get('/account', async function (req, res) {
  // Protect this route by checking if user is logged in
  if (!req.session.user) {
    res.redirect('/login')
    return
  }

  let details = {}
  let photo = null

  try {
    details = await getUserDetails(req.session.user.accessToken)
    photo = await getUserPhoto(req.session.user.accessToken)
  } catch (err) {
    console.log('### 💥 ERROR! Problem calling graph API')
    console.log('### 💥 ERROR! ', err)
  }

  res.render('account', {
    title: 'Node DemoApp: Account',
    details: details,
    photo: photo,
  })
})

export default router
