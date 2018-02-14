require('dotenv').config()

// App Insights. Set APPINSIGHTS_INSTRUMENTATIONKEY as app setting or env var
if(process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  const appInsights = require("applicationinsights");
  appInsights.setup()
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setUseDiskRetryCaching(true);
  appInsights.start();
}

// Include the cluster module!
var cluster = require('cluster');

// Code to run if we're in the master process
// Note. The APP_POOL_ID check is a test to see if we're running in Azure App Service 
//  - where using cluster & fork doesn't work :'( 
if (cluster.isMaster && !process.env.APP_POOL_ID) {
  // Count the machine's CPUs
  var cpuCount = require('os').cpus().length;
  console.log(`### Starting cluster, detected ${cpuCount} cores, spawning workers for each`);

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }
} else {
  // Code to run if we're in a worker process, i.e. the main express app
  var express = require('express');
  var path = require('path');
  var logger = require('morgan');
  var bodyParser = require('body-parser');
  var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

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

  // Start the server, wow!
  var port = process.env.PORT || 3000
  app.listen(port);
  console.log(`### Server process listening on port ${port}`);
}