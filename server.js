// App Insights. Set APPINSIGHTS_INSTRUMENTATIONKEY as app setting or env var
if(process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  const appInsights = require("applicationinsights");
  appInsights.setup()
  appInsights.start();
}

// Include the cluster module
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {
  // Count the machine's CPUs
  var cpuCount = require('os').cpus().length;
  console.log(`### Starting master, detected ${cpuCount} cores, spawning workers for each`);

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

  var routes = require('./routes/allroutes');
  app.use('/', routes);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  // Start the server, wow!
  var port = process.env.PORT || 3000
  app.listen(port);
  console.log(`### Server process ${cluster.worker.id} listening on port ${port}`);
}