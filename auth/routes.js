var express = require('express');
var router = express.Router();
const passport = require('passport');

router.get('/login', 
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/loginfailed' }),
  function(req, res) {
    log.info('Login was called in the Sample');
    res.redirect('/');
});

router.post('/auth/openid/return', passport.authenticate('azuread-openidconnect', { failureRedirect: '/loginfailed' }),
  function(req, res) {
    res.redirect('/');
  }
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/account', function(req, res){
  res.render('account', { 
    title: 'Node DemoApp: Account'
  });
});

// =======================================================================
// Page to generate server side errors, good for App Insights demos
// =======================================================================
router.get('/loginfailed', function (req, res, next) {
  throw new Error('Login failed')
});

module.exports = router;