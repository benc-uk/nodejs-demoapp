const request = require('supertest')
const app = require('../server')

describe('Check home page', function () {
  it('Responds with 200 & HTML', function (done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(/Ben Coleman/)
      .expect(200, done)
  })
})

describe('Check info results', function () {
  it('Responds with valid info', function (done) {
    request(app)
      .get('/info')
      .expect(/Node Version/)
      .expect(200, done)
  })
})

describe('Check tools page', function () {
  it('Responds with 200 & HTML', function (done) {
    request(app).get('/tools').expect('Content-Type', /html/).expect(200, done)
  })
})

describe('Check error page', function () {
  it('Responds with 404', function (done) {
    request(app).get('/foobar').expect(404, done)
  })
})

describe('Weather API', function () {
  if (process.env.WEATHER_API_KEY) {
    it('Responds with 200', function (done) {
      request(app).get('/api/weather/51.40329/0.05619').expect(200, done)
    })
  } else {
    it('Responds with 500', function (done) {
      request(app).get('/api/weather/51.40329/0.05619').expect(500, done)
    })
  }
})

describe('Monitor API returns data', function () {
  it('Responds & provides metrics', function (done) {
    request(app)
      .get('/api/monitoringdata')
      .expect('Content-Type', /json/)
      .expect(/memTotalBytes/)
      .expect(/memUsedBytes/)
      .expect(/cpuAppPercentage/)
      .expect(200, done)
  })
})
