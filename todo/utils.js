//
// Simple utils class with static helper functions
// -----------------------------------------------
// Ben C, March 2018
//

class Utils {
  //
  // Try to send back the underlying error code and message
  //
  sendError(res, err, code = 500) {
    console.dir(err);
    console.log(`### Error with API ${JSON.stringify(err)}`); 
    let statuscode = code;
    if(err.code > 1) statuscode = err.code;

    // App Insights
    const appInsights = require("applicationinsights");    
    if(appInsights.defaultClient) appInsights.defaultClient.trackException({exception: err});
    
    res.status(statuscode).send(err);
    return;
  }

  //
  // Just sends data
  //
  sendData(res, data) {
    // App Insights
    const appInsights = require("applicationinsights");    
    if(appInsights.defaultClient) appInsights.defaultClient.trackEvent({name: "dataEvent", properties: {data: JSON.stringify(data)}});
    
    res.status(200).send(data)
    return;    
  }

  //
  // Security check function, check a supplied code using TOTP
  //
  verifyCode(code) {
    if(!process.env.API_SECRET) return true;
    let jsotp = require('jsotp');
    let totp = jsotp.TOTP(process.env.API_SECRET);
    return totp.verify(code);
  }

  //
  // Simple random ID generator, good enough, with len=6 it's a 1:56 billion chance of a clash
  //
  makeId(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  //
  // Sleep, call with await
  //
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }  
}

module.exports = new Utils();
