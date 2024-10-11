//
// Main Express server for nodejs-demoapp
// ---------------------------------------------
// Ben C, Oct 2017 - Updated: Oct 2024
//

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))
console.log(`### 🚀 Node.js demo app v${packageJson.version} starting...`)

// Dotenv handy for local config & debugging
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import appInsights from 'applicationinsights'

// Configure App Insights
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  // Note we are keeping on the old v2.x SDK for now as the v3.x SDK doesn't work very well
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setSendLiveMetrics(true)
    .setAutoCollectConsole(true, true)
    .start()

  console.log('### 🩺 Azure App Insights enabled')
}

// Core Express & logging stuff
import express from 'express'
import path from 'path'
import logger from 'morgan'
import session from 'express-session'
import { createClient as createRedisClient } from 'redis'
import RedisStore from 'connect-redis'
import { readFileSync } from 'fs'

const app = new express()

// View engine setup, static content & session
const __dirname = path.resolve()
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'todo')])
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

// Session required for auth and MSAL signin flow
const sessionConfig = {
  secret: packageJson.name,
  cookie: { secure: false },
  resave: false,
  saveUninitialized: false,
}

// Very optional Redis session store - only really needed when running multiple instances
if (process.env.REDIS_SESSION_HOST) {
  const redisClient = createRedisClient({ url: `redis://${process.env.REDIS_SESSION_HOST}` })

  redisClient.connect().catch((err) => {
    console.error('### 🚨 Redis session store error:', err.message)
    process.exit(1)
  })

  sessionConfig.store = new RedisStore({ client: redisClient })
  console.log('### 📚 Session store configured using Redis')
} else {
  console.log('### 🎈 Session store not configured, sessions will not persist')
}

app.use(session(sessionConfig))

// Request logging, switch off when running tests
if (process.env.NODE_ENV !== 'test') {
  app.use(
    logger('dev', {
      skip: function (req, res) {
        // Don't log the signin code PKCE redirect
        return req.path.indexOf('/signin') == 0
      },
    }),
  )
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
if (process.env.ENTRA_APP_ID) {
  app.use('/', authRoutes)
}

// Optional routes based on certain settings/features being enabled
if (process.env.TODO_MONGO_CONNSTR) {
  app.use('/', todoRoutes)
}

// Make package app version a global var, shown in _foot.ejs
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
