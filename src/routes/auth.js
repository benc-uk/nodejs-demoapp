//
// Routes used by login and account screen
// ---------------------------------------------
// Ben C, Nov 2020
//

const express = require('express')
const router = express.Router()
const axios = require('axios')
const msal = require('@azure/msal-node')

const AUTH_SCOPES = ['user.read']
const AUTH_ENDPOINT = 'https://login.microsoftonline.com/common'
const AUTH_CALLBACK_PATH = 'redirect'
const AAD_REDIRECT_URL_BASE = process.env.AAD_REDIRECT_URL_BASE || `http://localhost:${process.env.PORT || 3000}`

// Create MSAL application object
const msalApp = new msal.ConfidentialClientApplication({
  auth: {
    clientId: process.env.AAD_APP_ID,
    authority: AUTH_ENDPOINT,
    clientSecret: process.env.AAD_APP_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(level, msg) {
        console.log('### MSAL: ', msg)
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Info,
    },
  },
})

console.log(`### MSAL configured using client ID: ${process.env.AAD_APP_ID}`)

// ==============================
// Routes
// ==============================

router.get('/login', async (req, res) => {
  // Get URL to sign user in and consent to scopes needed for application
  try {
    const authURL = await msalApp.getAuthCodeUrl({
      scopes: AUTH_SCOPES,
      redirectUri: `${AAD_REDIRECT_URL_BASE}/${AUTH_CALLBACK_PATH}`,
    })
    // Now redirect to the oauth2 URL we have been given
    res.redirect(authURL)
  } catch (err) {
    res.render('error', {
      title: 'MSAL authentication failed',
      message: err,
      error: err,
    })
  }
})

router.get('/redirect', async (req, res) => {
  try {
    const tokenResponse = await msalApp.acquireTokenByCode({
      code: req.query.code,
      scopes: AUTH_SCOPES,
      redirectUri: `${AAD_REDIRECT_URL_BASE}/${AUTH_CALLBACK_PATH}`,
    })
    if (!tokenResponse) {
      // eslint-disable-next-line quotes
      throw "No token returned! that's pretty bad"
    }

    // Store user details in session
    req.session.user = {
      account: tokenResponse.account,
      accessToken: tokenResponse.accessToken,
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
    console.log('### ERROR! Problem calling graph API')
    console.log('### ERROR! ', err)
  }

  res.render('account', {
    title: 'Node DemoApp: Account',
    details: details,
    photo: photo,
  })
})

// ==============================
// MS Graph calls
// ==============================

async function getUserDetails(accessToken) {
  try {
    let graphReq = {
      url: 'https://graph.microsoft.com/v1.0/me',
      headers: { Authorization: accessToken },
    }

    let resp = await axios(graphReq)
    return resp.data
  } catch (err) {
    console.log(`### ERROR! Failed to get user details ${err.toString()}`)
  }
}

async function getUserPhoto(accessToken) {
  try {
    let graphReq = {
      url: 'https://graph.microsoft.com/v1.0/me/photo/$value',
      responseType: 'arraybuffer',
      headers: { Authorization: accessToken },
    }

    let resp = await axios(graphReq)
    return new Buffer.from(resp.data, 'binary').toString('base64')
  } catch (err) {
    console.log(`### ERROR! Failed to get user photo ${err.toString()}`)
  }
}

module.exports = router
