var express = require('express');
var router = express.Router();
const os = require('os');
const fs = require('fs');
const axios = require('axios');

// =======================================================================
// Middleware to pick up if user is logged in via Azure App Service Auth
// =======================================================================
router.use(function(req, res, next) {
  if(req.user) {
    req.app.locals.user = req.user.profile; //headers['x-ms-client-principal-name'];
  } else {
    req.app.locals.user = null;
  }
  next(); 
});

// =======================================================================
// Get home page and index
// =======================================================================
router.get('/', function (req, res, next) { 
  res.render('index', 
  { 
    title: 'Node DemoApp: Home'
  });
});

// =======================================================================
// Get system & runtime info 
// =======================================================================
router.get('/info', function (req, res, next) {
  let packagejson = require('./package.json');

  let info = { 
    release: os.release(), 
    type: os.type(), 
    cpus: os.cpus(), 
    hostname: os.hostname(), 
    arch: os.arch(),
    mem: Math.round(os.totalmem() / 1048576),
    env: process.env.WEBSITE_SITE_NAME ? process.env.WEBSITE_SITE_NAME.split('-')[0] : 'Local',
    nodever: process.version,
    appver: packagejson.version,
    uptime: convertSeconds(os.uptime())
  }

  res.render('info', 
  { 
    title: 'Node DemoApp: Info', 
    info: info, 
    isDocker: fs.existsSync('/.dockerenv'),
    isKube: fs.existsSync('/var/run/secrets/kubernetes.io')
  });
});


// =======================================================================
// Get weather data as JSON
// =======================================================================
router.get('/api/weather/:lat/:long', async function (req, res, next) {
  var WEATHER_API_KEY = process.env.WEATHER_API_KEY || "123456";
  let long = req.params.long
  let lat = req.params.lat

  // Call Darksky weather API
  try {
    let weather = await axios.get(`https://api.darksky.net/forecast/${WEATHER_API_KEY}/${lat},${long}?units=uk2`);

    if(weather.data.currently) {
      const appInsights = require("applicationinsights");    
      if(appInsights.defaultClient) appInsights.defaultClient.trackMetric({name: "weatherTemp", value: weather.data.currently.temperature});
      
      res.status(200).send({ 
        long: long,
        lat: lat,
        summary: weather.data.currently.summary,
        icon: weather.data.currently.icon,          
        temp: weather.data.currently.temperature,
        precip: weather.data.currently.precipProbability,
        wind: weather.data.currently.windSpeed,
        uv: weather.data.currently.uvIndex,
        forecastShort: weather.data.hourly.summary,
        forecastLong: weather.data.daily.summary
      });      
    } else  {
      throw new Error(`Current weather not available for: ${long},${lat}`)
    }
  } catch(e) {    
    return res.status(500).send(`API error fetching weather: ${e.toString()}`);
  }
});


// =======================================================================
// 
// =======================================================================
router.get('/api/monitoringdata', async function (req, res, next) {
  let data = {
    container: false,
    memUsedBytes: 0,
    memTotalBytes: 0,
    memAppUsedBytes: 0,
    cpuAppPercentage: 0
  }

  // Gather monitoring data
  try {
    // MEMORY
    if(fs.existsSync('/.dockerenv')) {
      data.container = true;

      // Read cgroup container memory info
      data.memUsedBytes = parseInt( fs.readFileSync('/sys/fs/cgroup/memory/memory.usage_in_bytes', 'utf8') );
      data.memTotalBytes = parseInt( fs.readFileSync('/sys/fs/cgroup/memory/memory.limit_in_bytes', 'utf8') );
      
      // limit_in_bytes might not be set, in which case it contains some HUGE number
      // Fall back to using os.totalmem()
      if(data.memTotalBytes > 90000000000000) {
        data.memTotalBytes = os.totalmem();
      }
    } else {
      data.free = os.freemem();
      data.memUsedBytes = os.totalmem() - os.freemem();
      data.memTotalBytes = os.totalmem();
    }
    data.memProcUsedBytes = process.memoryUsage().rss;

    // CPU
    const startUsage = process.cpuUsage();    
    const D_TIME = 1000;
    // pause 
    const timeout = ms => new Promise(res => setTimeout(res, ms))
    await timeout(D_TIME)
    // Get results/delta
    let cpuResult = process.cpuUsage(startUsage);
    data.cpuAppPercentage = (((cpuResult.user) / 1000) / D_TIME) * 100

    return res.status(200).send(data);
  } catch(e) {    
    return res.status(500).send({ error: true, title: 'Monitoring API error', message: e.toString() });
  }
});

// =======================================================================
// Get monitor page
// =======================================================================
router.get('/monitor', function (req, res, next) {
  res.render('monitor', 
  { 
    title: 'Node DemoApp: Monitoring'
  });
});

// =======================================================================
// Get weather page
// =======================================================================
router.get('/weather', function (req, res, next) {
  res.render('weather', 
  { 
    title: 'Node DemoApp: Weather'
  });
});


// =======================================================================
// Tools page
// =======================================================================
router.get('/tools', function (req, res, next) {
  res.render('tools', 
  { 
    title: 'Node DemoApp: Tools'
  });
});


// =======================================================================
// Page to generate CPU load
// =======================================================================
router.get('/tools/load', function (req, res, next) {
  var start = new Date().getTime();
  for(i = 0; i < 499900000.0; i++) { 
    var val = Math.pow(9000.0, 9000.0);
  }

  let time = (new Date().getTime() - start);

  res.render('tools', 
  { 
    title: 'Node DemoApp: Tools',
    message: `I did some really hard sums and it only took me ${time} milliseconds!`
  });
});


// =======================================================================
// Page to generate server side errors, good for App Insights demos
// =======================================================================
router.get('/tools/error', function (req, res, next) {
  // Call some gibberish (object doesn't exist) which should trigger an exception 
  beansOnToast.eat();
});


// =======================================================================
// Page to force GC
// =======================================================================
router.get('/tools/gc', function (req, res, next) {
  let message = 'Garbage collector was not able to run';
  try {
    if (global.gc) {
      global.gc();
      message = 'Garbage collector was run';
    } 
  } catch (e) {  }

  res.render('tools', 
  { 
    title: 'Node DemoApp: Tools',
    message: message
  });
});

module.exports = router;

// ******* UTILS HERE *************************************************************

// Util to convert seconds to DD:HH:MM:SS 
function convertSeconds(n)  { 
  let days = Math.floor(n / (24 * 3600)); 
  n = n % (24 * 3600); 
  let hours = Math.floor(n / 3600); 
  n %= 3600; 
  let mins = Math.floor(n / 60); 
  n %= 60; 
  let secs = n;
  return `${days} days, ${hours} hours, ${mins} mins, ${secs} seconds`;
} 