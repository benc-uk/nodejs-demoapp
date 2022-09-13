//
// Adds Prometheus metrics to the /metrics endpoint
// NOTE: Works a little differently to the other routes
// --------------------------------------------------------
// Ben C, Sept 2022
//

import PromMiddleware from 'express-prometheus-middleware'

export default function addMetrics(app) {
  app.use(
    PromMiddleware({
      metricsPath: '/metrics',
      collectDefaultMetrics: true,
      requestDurationBuckets: [0.1, 0.5, 1, 1.5],
      requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
      responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    })
  )
}
