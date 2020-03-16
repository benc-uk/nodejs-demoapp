const session = require('express-session')
const passport = require('passport')
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy
const cookieParser = require('cookie-parser')

//
// This sets up all middleware and Passport gubbins
// For AAD v2 authentication and sign-in
// It's kept here to stop cluttering server.js with weirdness
//
module.exports = function(app) {
  console.log('### Setting up AAD authentication middleware and OIDC')

  app.use(cookieParser())
  passport.serializeUser(function(user, done) {
    done(null, user)
  })

  passport.deserializeUser(function(user, done) {
    done(null, user)
  })

  app.use(session({
    secret: 'LMCIwZKyIIVmy4fX19RE5uuvFzCAjxrd',
    resave: true,
    saveUninitialized: false
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new OIDCStrategy({
    identityMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    //identityMetadata: `https://login.microsoftonline.com/${process.env.AAD_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AAD_APP_ID,
    redirectUrl: `${process.env.AAD_REDIRECT_URL_BASE}/auth/openid/return`,
    allowHttpForRedirectUrl: true,
    validateIssuer: false,
    clientSecret: process.env.AAD_APP_SECRET,
    responseType: 'code id_token',
    responseMode: 'form_post',
    scope: ['email', 'profile', 'offline_access', 'user.read'],
    loggingLevel: 'error'
  },
  signInComplete))
}

async function signInComplete(iss, sub, profile, accessToken, refreshToken, params, done) {
  if (!profile.oid) {
    return done(new Error('No OID found, that\'s pretty bad :('), null)
  } else {
    // var graph = require('@microsoft/microsoft-graph-client');
    //let usr = await getUserDetails(accessToken);
    return done(null, { profile: profile, token: accessToken })
  }
}

