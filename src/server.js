//
// Main Express server for nodejs-demoapp
// ---------------------------------------------
// Ben C, Oct 2017 - Updated: Apr 2019
//

console.log('### Node.js demo app starting...')

// Dotenv handy for local config & debugging
require('dotenv').config()

// App Insights. Set APPINSIGHTS_INSTRUMENTATIONKEY as App Setting or env var
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  const appInsights = require('applicationinsights')
  appInsights
    .setup()
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)

  appInsights.start()
}

// Core Express & logging stuff
const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const app = express()
const session = require('express-session')

// View engine setup, static content & session
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(
  session({
    secret: 'Shape without form, shade without colour',
    cookie: { secure: false },
    resave: false,
    saveUninitialized: false,
  })
)

// Logging
app.use(logger('dev'))

// Parsing middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Routes & controllers
app.use('/', require('./routes/pages'))
app.use('/', require('./routes/api'))

// Initialize authentication only when configured
if (process.env.AAD_APP_ID && process.env.AAD_APP_SECRET) {
  app.use('/', require('./routes/auth'))
}

// Optional routes based on certain settings/features being enabled
if (process.env.TODO_MONGO_CONNSTR) {
  app.use('/', require('./todo/routes'))
}

// Make package app version a global var, shown in _foot.ejs
app.locals.version = require('./package.json').version

// Catch all route, generate an error & forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  if (req.method != 'GET') {
    err = new Error(`Method ${req.method} not allowed`)
    err.status = 500
  }

  next(err)
})

// Error handler
app.use(function (err, req, res, next) {
  console.error(`### ERROR: ${err.message}`)

  // App Insights
  const appInsights = require('applicationinsights')
  if (appInsights.defaultClient) {
    appInsights.defaultClient.trackException({ exception: err })
  }

  // Render the error page
  res.status(err.status || 500)
  res.render('error', {
    title: 'Error',
    message: err.message,
    error: err,
  })
})

// Get values from env vars or defaults where not provided
let port = process.env.PORT || 3000

// Start the server
app.listen(port)
console.log(`### Server listening on port ${port}`)

module.exports = app
