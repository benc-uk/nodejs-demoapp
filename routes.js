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

  var date = new Date(null);
  date.setSeconds(os.uptime()); // specify value for SECONDS here
  var result = date.toISOString();//.substr(0, 8);

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
    uptime: convertSectoDay(os.uptime())
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
// Tools page
// =======================================================================
router.get('/tools', function (req, res, next) {
  res.render('tools', 
  { 
    title: 'Node DemoApp: Tools'
  });
});


// =======================================================================
// Get weather data as JSON
// =======================================================================
router.get('/api/weather/:lat/:long', async function (req, res, next) {
  var WEATHER_API_KEY = process.env.WEATHER_API_KEY || "123456";
  let long = req.params.long
  let lat = req.params.lat

  //https://geocode.xyz/51.40329,0.05619?json=1

  // Call Darksky weather API
  try {
    //let loc = await axios.get(`https://geocode.xyz/51.40329,0.05619?json=1`);
    let weather = await axios.get(`https://api.darksky.net/forecast/${WEATHER_API_KEY}/${lat},${long}?units=uk2`);

    if(weather.data.currently) {
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
    return res.status(500).end(`API error fetching weather: ${e.toString()}`);
  }
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
// Page to generate CPU load
// =======================================================================
router.get('/load', function (req, res, next) {
  var start = new Date().getTime();;
  for(i = 0; i < 499900000.0; i++) { 
    var val = Math.pow(9000.0, 9000.0);
  }

  res.render('load', 
  { 
    title: 'Node DemoApp: Load', 
    val: val,
    time: (new Date().getTime() - start)
  });
});


// =======================================================================
// Page to generate server side errors, good for App Insights demos
// =======================================================================
router.get('/error', function (req, res, next) {
  // Call some gibberish (object doesn't exist) which should trigger an exception 
  beansOnToast.eat();
});

module.exports = router;

//
// Util to convert seconds to DD:HH:MM:SS
// 
function convertSectoDay(n)  { 
  let days = Math.floor(n / (24 * 3600)); 
  n = n % (24 * 3600); 
  let hours = Math.floor(n / 3600); 
  n %= 3600; 
  let mins = Math.floor(n / 60); 
  n %= 60; 
  let secs = n; 
  return `${days} days, ${hours} hours, ${mins} mins, ${secs} seconds`;
} 