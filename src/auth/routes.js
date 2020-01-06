const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');

// ==============================
// Routes
// ==============================

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
  req.session.destroy(function(err) {
    req.logout();
    res.redirect('/');
  });
});

router.get('/account', async function(req, res) {
  if(!req.user) { res.redirect('/login'); return; }
  let details = {};
  let photo = null;

  try {
    details = await getUserDetails(req.user.token);
    photo = await getUserPhoto(req.user.token);       
  } catch(err) {
    console.log("### ERROR! Problem calling graph API");
    console.log("### ERROR! ", err);
  }

  res.render('account', { 
    title: 'Node DemoApp: Account',
    details: details,
    photo: photo
  });  
});


router.get('/loginfailed', function (req, res, next) {
  throw new Error('Login failed')
});

module.exports = router;

// ==============================
// MS Graph calls
// ==============================

async function getUserDetails(accessToken) { 
  try {
    let graphReq = {
      url: "https://graph.microsoft.com/v1.0/me",
      headers: { "Authorization": accessToken,  }
    }

    let resp = await axios(graphReq);
    return resp.data
  } catch(err) {
    console.log(`### ERROR! Failed to get user details ${err.toString()}`);
  }
}

async function getUserPhoto(accessToken) { 
  try {
    let graphReq = {
      url: "https://graph.microsoft.com/v1.0/me/photo/$value",
      responseType: 'arraybuffer',
      headers: { "Authorization": accessToken }
    }

    let resp = await axios(graphReq);
    return new Buffer.from(resp.data, 'binary').toString('base64');
  } catch(err) {
    console.log(`### ERROR! Failed to get user photo ${err.toString()}`);
  }
}