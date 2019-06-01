const session = require('express-session');
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const cookieParser = require('cookie-parser');

//
// This sets up all middleware and Passport gubbins
// For AAD v2 authentication and sign-in
// It's kept here to stop cluttering server.js with weirdness
//
module.exports = function(app) {
  app.use(cookieParser())
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.use(session({
    secret: 'LMCIwZKyIIVmy4fX19RE5uuvFzCAjxrd',
    resave: true,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new OIDCStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.AAD_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AAD_APP_ID,
    redirectUrl: 'http://localhost:3000/auth/openid/return',
    allowHttpForRedirectUrl: true,
    clientSecret: process.env.AAD_APP_SECRET,
    responseType: 'id_token code',
    responseMode: 'form_post',
    scope: ['email', 'profile'],
    loggingLevel: 'error'
  },

  function(iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.oid) {
      return done(new Error("No oid found"), null);
    } else {
      return done(null, profile);
    }
  })); 
};
