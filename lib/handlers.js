const _data = require('./data')
const helpers = require('./helpers')

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

handlers.users = (data, cb) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, cb)
  } else {
    cb(405)
  }
}

// User container submethods
handlers._users = {
  get: (data, cb) => {

  },

  /** 
   * Users - Post
   * Required data: firstName, lastName, phoneNumber, password, tosAgreement
   * Optional data: none
   */
  post: (data, cb) => {

    // Chekc all the requirements
    const firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ?
      data.payload.firstName.trim() :
      false

    const lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ?
      data.payload.lastName.trim() :
      false

    const phoneNumber = typeof (data.payload.phoneNumber) === 'string' && data.payload.phoneNumber.trim().length === 10 ?
      data.payload.phoneNumber.trim() :
      false

    const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ?
      data.payload.password.trim() :
      false

    const tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ?
      true :
      false

    if (firstName && lastName && phoneNumber && password && tosAgreement) {
      _data.read('users', phoneNumber, (err, data) => {
        if (err) {
          // Hash the password
          const hashedPassword = helpers.hash(password)

          if (hashedPassword) {
            // Create an user object
            const userObject = {
              'firstName': firstName,
              'lastName': lastName,
              'phoneNumber': phoneNumber,
              'hashedPassword': hashedPassword,
              'tosAgreement': true
            }

            // Store user
            _data.create('users', phoneNumber, userObject, (err) => {
              if (!err) {
                cb(200)
              } else {
                console.log(err)
                cb(400, {
                  'Error': 'Could not create the new user'
                })
              }
            })
          } else {
            cb(500, {
              'Erro': 'Could not hash the user\'s password'
            })
          }

        } else {
          cb(400, {
            'Error': 'A user with that phone number already exists'
          })
        }
      })
    } else {
      cb(400, {
        'Error': 'Missing required fields'
      })
    }
  },
  put: (data, cb) => {

  },
  delete: (data, cb) => {

  }
}

module.exports = handlers