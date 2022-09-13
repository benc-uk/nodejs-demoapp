//
// Main Express server for nodejs-demoapp
// ---------------------------------------------
// Ben C, Oct 2017 - Updated: Sept 2022
//

console.log('### 🚀 Node.js demo app starting...')

// Dotenv handy for local config & debugging
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import appInsights from 'applicationinsights'

// App Insights.
// Enable by setting APPLICATIONINSIGHTS_CONNECTION_STRING env var
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING).setSendLiveMetrics(true).start()
  appInsights.start()
  console.log('### 🩺 Azure App Insights enabled')
}

// Core Express & logging stuff
import express from 'express'
import path from 'path'
import logger from 'morgan'
import session from 'express-session'

const app = new express()

// View engine setup, static content & session
const __dirname = path.resolve()
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'todo')])
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

// Session required for auth and MSAL signin flow
app.use(
  session({
    secret: '5Dyw14E3fEGHBWGPgw2X2dcEl8MVYhokBm1Ww5s2e0pe2wEryC8v3llGnGDm',
    cookie: { secure: false },
    resave: false,
    saveUninitialized: false,
  })
)

// Request logging, switch off when running tests
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'))
}

// Parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Routes & controllers
import pageRoutes from './routes/pages.mjs'
import apiRoutes from './routes/api.mjs'
import authRoutes from './routes/auth.mjs'
import todoRoutes from './todo/routes.mjs'
import addMetrics from './routes/metrics.mjs'

// Prometheus metrics, enabled by default
if (process.env.DISABLE_METRICS !== 'true') {
  // Can't use app.use() here due to how the metrics middleware wants to be registered
  addMetrics(app)
}

// Core routes we always want
app.use('/', pageRoutes)
app.use('/', apiRoutes)

// Initialize authentication only when configured
if (process.env.AAD_APP_ID) {
  app.use('/', authRoutes)
}

// Optional routes based on certain settings/features being enabled
if (process.env.TODO_MONGO_CONNSTR) {
  app.use('/', todoRoutes)
}

// Make package app version a global var, shown in _foot.ejs
import { readFileSync } from 'fs'
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))
app.locals.version = packageJson.version

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
  console.error(`### 💥 ERROR: ${err.message}`)

  // App Insights
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
const port = process.env.PORT || 3000

// Start the server
app.listen(port)
console.log(`### 🌐 Server listening on port ${port}`)

export default app
