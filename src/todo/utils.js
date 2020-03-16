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
    console.dir(err)
    console.log(`### Error with API ${JSON.stringify(err)}`)
    let statuscode = code
    if (err.code > 1) { statuscode = err.code }

    // App Insights
    const appInsights = require('applicationinsights')
    if (appInsights.defaultClient) { appInsights.defaultClient.trackException({ exception: err }) }

    res.status(statuscode).send(err)
    return
  }

  //
  // Just sends data
  //
  sendData(res, data) {
    // App Insights
    const appInsights = require('applicationinsights')
    if (appInsights.defaultClient) { appInsights.defaultClient.trackEvent({ name: 'dataEvent', properties: { data: JSON.stringify(data) } }) }

    res.status(200).send(data)
    return
  }
}

module.exports = new Utils()
