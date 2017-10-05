var express = require('express');
var router = express.Router();
const os = require('os');
const fs = require('fs');
const request = require('request');


///////////////////////////////////////////
// Get home page and index
///////////////////////////////////////////
router.get('/', function (req, res, next) {
    res.render('index', 
    { 
      title: 'Node DemoApp - Home', 
      ver: process.env.npm_package_version
    });
});


///////////////////////////////////////////
// Get system & runtime info 
///////////////////////////////////////////
router.get('/info', function (req, res, next) {
  var info = { 
    release: os.release(), 
    type: os.type(), 
    cpus: os.cpus(), 
    hostname: os.hostname(), 
    arch: os.arch(),
    mem: Math.round(os.totalmem() / 1048576),
    env: process.env.WEBSITE_SITE_NAME ? process.env.WEBSITE_SITE_NAME.split('-')[0] : 'Local',
    nodever: process.version
  }

  res.render('info', 
  { 
    title: 'Node DemoApp - Info', 
    info: info, 
    isDocker: fs.existsSync('/.dockerenv'), 
    ver: process.env.npm_package_version
  });
});


///////////////////////////////////////////
// Get weather page
///////////////////////////////////////////
router.get('/weather', function (req, res, next) {
  const WEATHER_API_KEY = "686028df24bb828907074f434121b2c0";
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if(ip.indexOf(":")) ip = ip.split(':')[0];

  var long = ''
  var lat = ''  
  var country = 'unknown country'  
  var city = '???'  

  // Geo IP reverse lookup
  request('http://freegeoip.net/json/' + ip, { json: true }, (apierr, apires, geo_api_body) => {
    if (apierr) { return console.log(apierr); }
    country = geo_api_body.country_name;
    city = geo_api_body.city;
    lat = geo_api_body.latitude;
    long = geo_api_body.longitude;

    // Call Darksky weather API
    request(`https://api.darksky.net/forecast/${WEATHER_API_KEY}/${lat},${long}?units=uk2`, { json: true }, (apierr, apires, weather) => {
      if (apierr) { return console.log(apierr); }
      if(weather.currently) {
        res.render('weather', { 
          ip: ip,
          long: long,
          lat: lat,
          country: country,
          city: city,
          summary: weather.currently.summary,
          icon: weather.currently.icon,          
          temp: weather.currently.temperature,
          precip: weather.currently.precipProbability,
          wind: weather.currently.windSpeed,
          title: 'Node DemoApp - Weather', 
          ver: process.env.npm_package_version
        }); 
      } else {
        return res.status(500).end('API error fetching weather: ' + apierr + ' - '+apires);
      }
    });
  });
});


///////////////////////////////////////////
// Page to generate CPU load
///////////////////////////////////////////
router.get('/load', function (req, res, next) {

  var start = new Date().getTime();;
  for(i = 0; i < 499900000.0; i++) { 
    var val = Math.pow(9000.0, 9000.0);
  }

  res.render('load', 
  { 
    title: 'Node DemoApp - Load', 
    val: val,
    time: (new Date().getTime() - start),
    ver: process.env.npm_package_version
  });
});

module.exports = router;