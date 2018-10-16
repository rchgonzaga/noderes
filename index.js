/*
 *  Primiray API file
 * 
 */

// Dependecies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const fs = require('fs')
const _data = require('./lib/data')

// Testing
_data.read('test', 'newFile', (err, data) => {
  console.log('this was the erro: ', err, data)
})

// The httpServer should responto to all requests with a string
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res)
})
// Instantiation the http httpServer
httpServer.listen(config.httpPort, () => {
  console.log(`The httpServer is listegin on port ${config.httpPort} in '${config.envName}'`)
})

// // The httpServers should responto to all requests with a string
// const httpsServerOptions = {
//   'key': fs.readFileSync('./https/key.pem'),
//   'cert': fs.readFileSync('./https/cert.pem')
// }
// const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
//   unifiedServer(req, res)
// })
// // Instantiation the http httpsServers
// httpsServer.listen(config.httpsPort, () => {
//   console.log(`The httpServer is listegin on port ${config.httpsPort} in '${config.envName}'`)
// })

const unifiedServer = (req, res) => {
  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true)

  // Get path from url
  // This will clean the url and keep the middle bar, ex: foo/bar/ => foo/bar
  const path = parsedUrl.pathname.replace(/^\/+|\/+$g/, '')

  // Get the query string as an object
  const queryStringObject = parsedUrl.query

  // Get the HTTP method
  const method = req.method.toLocaleLowerCase()

  // Get headers as an object
  const headers = req.headers

  // Get the payload if there's any
  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', data =>
    buffer += decoder.write(data)
  )

  req.on('end', () => {

    buffer += decoder.end()

    // Choose the handler this request should go to
    const chosenHandler = typeof (router[path]) !== 'undefined' ? router[path] : handlers.notFound

    // Construct the data to send to the handler
    const data = {
      'path': path,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // User the status code called back by the handler, or default 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200

      // Use the payload called back by the handler, or default to an ampty object
      payload = typeof (payload) == 'object' ? payload : {}

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload)

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      // Send the response
      res.end(payloadString)
      // Log the request path
      // console.log('Request received on path: ' + path + ' with this method: ' + method + ' with these query string parameters: ' + JSON.stringify(queryStringObject))
      // console.log('\nAnd with this header: ' + JSON.stringify(headers))
      // console.log('\nAnd with this payload: ' + buffer)
      console.log('Returning this response: ', statusCode, payloadString)
    })
  })
}
// Define handlers
const handlers = {}
// Sample handler
handlers.sampler = (data, cb) => {
  // Callback a http status code and a payload object
  cb(406, {
    'name': 'Sample handler',
    'data': data
  })
}

// Sample handler
handlers.ping = (data, cb) => {
  // Callback a http status code and a payload object
  cb(200)
}

// Not found handler
handlers.notFound = (data, cb) => {
  cb(404)
}

// Define a request router
const router = {
  'sampler': handlers.sampler,
  'ping': handlers.ping
}