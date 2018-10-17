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

module.exports = handlers