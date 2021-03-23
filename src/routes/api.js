//
// API routes, that return JSON
// ---------------------------------------------
// Ben C, Jan 2020
//

const express = require('express')
const router = express.Router()
const axios = require('axios')
const fs = require('fs')
const os = require('os')

// =======================================================================
// Get weather data as JSON
// =======================================================================
router.get('/api/weather/:lat/:long', async function (req, res, next) {
  let WEATHER_API_KEY = process.env.WEATHER_API_KEY || '123456'
  let long = req.params.long
  let lat = req.params.lat

  // Call Darksky weather API
  try {
    let weather = await axios.get(`https://api.darksky.net/forecast/${WEATHER_API_KEY}/${lat},${long}?units=uk2`)

    if (weather.data.currently) {
      const appInsights = require('applicationinsights')
      if (appInsights.defaultClient) {
        appInsights.defaultClient.trackMetric({ name: 'weatherTemp', value: weather.data.currently.temperature })
      }

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
        forecastLong: weather.data.daily.summary,
      })
    } else {
      throw new Error(`Current weather not available for: ${long},${lat}`)
    }
  } catch (e) {
    return res.status(500).send(`API error fetching weather: ${e.toString()}`)
  }
})

// =======================================================================
// API for live monitoring (CPU and memory) data
// =======================================================================
router.get('/api/monitoringdata', async function (req, res, next) {
  let data = {
    container: false,
    memUsedBytes: 0,
    memTotalBytes: 0,
    memAppUsedBytes: 0,
    cpuAppPercentage: 0,
  }

  // Gather monitoring data
  try {
    // MEMORY
    if (fs.existsSync('/.dockerenv')) {
      data.container = true

      // Read cgroup container memory info
      data.memUsedBytes = parseInt(fs.readFileSync('/sys/fs/cgroup/memory/memory.usage_in_bytes', 'utf8'))
      data.memTotalBytes = parseInt(fs.readFileSync('/sys/fs/cgroup/memory/memory.limit_in_bytes', 'utf8'))

      // limit_in_bytes might not be set, in which case it contains some HUGE number
      // Fall back to using os.totalmem()
      if (data.memTotalBytes > 90000000000000) {
        data.memTotalBytes = os.totalmem()
      }
    } else {
      data.free = os.freemem()
      data.memUsedBytes = os.totalmem() - os.freemem()
      data.memTotalBytes = os.totalmem()
    }
    data.memProcUsedBytes = process.memoryUsage().rss

    // CPU
    const startUsage = process.cpuUsage()
    const D_TIME = 1000
    // pause
    const timeout = (ms) => new Promise((res) => setTimeout(res, ms))
    await timeout(D_TIME)
    // Get results/delta
    let cpuResult = process.cpuUsage(startUsage)
    data.cpuAppPercentage = (cpuResult.user / 1000 / D_TIME) * 100

    return res.status(200).send(data)
  } catch (e) {
    return res.status(500).send({ error: true, title: 'Monitoring API error', message: e.toString() })
  }
})

module.exports = router
