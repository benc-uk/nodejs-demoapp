//
// Main Express server for Nodejs-demoapp
// ---------------------------------------------
// Ben C, Oct 2017 - Updated: Jul 2018
//

// Dotenv handy for local config & debugging
require('dotenv').config()

// App Insights. Set APPINSIGHTS_INSTRUMENTATIONKEY as App Setting or env var
if(process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  const appInsights = require("applicationinsights");
  appInsights.setup()
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(true);

  appInsights.start();
}

// Core Express & logging stuff
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Logging
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

let mainRoutes = require('./routes/allroutes');
app.use('/', mainRoutes);
let todoRoutes = require('./todo/todo-routes');
app.use('/', todoRoutes);

// Catch all route, generate an error & forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  if(req.method != 'GET') { 
    err = new Error(`Method ${req.method} not allowed`);
    err.status = 500;
  }
  
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(`### ${err.message}`);
  
  // App Insights
  const appInsights = require("applicationinsights");    
  if(appInsights.defaultClient) appInsights.defaultClient.trackException({exception: err});

  // Render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error', 
    message: err.message,
    error: err
  });
});

// Get values from env vars or defaults where not provided
var port = process.env.PORT || 3000;
var monogUrl = process.env.MONGO_CONNSTR;  // Note. NO DEFAULT!
var retries = process.env.MONGO_RETRIES || 5;
var retryDelay = process.env.MONGO_RETRY_DELAY || 30;

// Mongo Connection totally optional
// - really only use it when demo'ing App Insights
if(monogUrl) {
  // Include our data-access library for MongoDB
  var dataAccess = require('./todo/data-access');

  dataAccess.connectMongo(monogUrl, retries, retryDelay)
  .then(() => {
    // This is important, pass our connected dataAccess - it's a global singleton
    app.set('data', dataAccess);

    // Normal express connect
    var server = app.listen(port, function () {
      var port = server.address().port;
      console.log(`### Server listening on ${server.address().port}`);
    });
  })
  .catch(err => {
    console.error(`### ERROR! Unable to connect to MongoDB!, URL=${process.env.MONGO_CONNSTR}`);
    console.error(err.message);
    process.exit(-1);
  })
} else {
  // Start the server, without Mongo
  app.listen(port);
  console.log(`### Server process listening on port ${port}`);
}


module.exports = app;