var express = require('express');
var router = express.Router();
const os = require('os');
const fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', 
    { 
      title: 'Node DemoApp - Home', 
      ver: process.env.npm_package_version
    });
});

/* GET home page. */
router.get('/info', function (req, res, next) {
  var info = { 
    release: os.release(), 
    type: os.type(), 
    cpus: os.cpus(), 
    hostname: os.hostname(), 
    arch: os.arch(),
    mem: Math.round(os.totalmem() / 1073741824),
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

module.exports = router;