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

  /**
   * Users - get
   * Required data: phone
   * Optional data: none
   * @TODO: Only let authenticated user access their objects. Don't let them access anypne elses data
   */
  get: (data, cb) => {
    // Check if the phone number is valid
    const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ?
      data.queryStringObject.phone.trim() :
      false

    if (phone) {

      // Get the toke nfrom the headers
      const token = typeof (data.headers.token) === 'string' ? data.headers.token : false

      // Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // Look up the user
          _data.read('users', phone, (err, data) => {
            if (!err && data) {
              // Remote the hash password
              delete data.hashedPassword
              cb(200, data)
            } else {
              cb(404)
            }
          })
        } else {
          cb(403, {
            'Error': 'Missing required token in header or token is invalid'
          })
        }
      })

    } else {
      cb(400, {
        'Eror': 'Missing required field'
      })
    }
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

  /** 
   *  Users - put
   * Required data: phone
   * Optional data: firstName, lastName, phoneNumber, password (at leat one must be specified)
   * @TODO: Only let an authenticated user update their own object. Don't let them update anyone elese's 
   *  
   */
  put: (data, cb) => {
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

    if (phoneNumber) {
      if (firstName || lastName || password || tosAgreement) {

        // Get the toke nfrom the headers
        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false

        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
          if (tokenIsValid) {
            // Lookup the user
            _data.read('users', phoneNumber, (err, userData) => {
              if (!err && userData) {
                // Update the fields
                if (firstName) {
                  userData.firstName = firstName
                }
                if (lastName) {
                  userData.lastName = lastName
                }
                if (password) {
                  userData.password = helpers.hash(password)
                }

                //Store update
                _data.update('users', phoneNumber, userData, (err) => {
                  if (!err) {
                    cb(200)
                  } else {
                    console.log(err)
                    cb(500, {
                      'Error': 'Could not update the user'
                    })
                  }
                })

              } else {
                cb(400, {
                  'Error': 'Specified user does not exist'
                })
              }
            })
          } else {
            cb(403, {
              'Error': 'Missing required token in header or token is invalid'
            })
          }
        })

      } else {
        cb(400, {
          'Error': 'Missing fields to update'
        })
      }
    } else {
      cb(400, {
        'Error': 'Missing required field'
      })
    }
  },

  /**
   * Users - delete
   * Optional data: firstName, lastName, phoneNumber, password(at leat one must be specified) *
   * @TODO: Only let an authenticated user update their own object.Don 't let them update anyone elese's
   * @TODO: Cleanup (delete) any other data files associated with this user
   */
  delete: (data, cb) => {
    // Check if the phone number is valid
    const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ?
      data.queryStringObject.phone.trim() :
      false

    if (phone) {
      // Look up the user
      _data.read('users', phone, (err, data) => {
        if (!err && data) {
          _data.delete('users', phone, (err) => {
            if (!err) {
              cb(200)
            } else {
              cb(500, {
                'Error': 'Could not delete the specified user'
              })
            }
          })
        } else {
          cb(400, {
            'Error': 'Could not find the specified user'
          })
        }
      })
    } else {
      cb(400, {
        'Eror': 'Missing required field'
      })
    }
  }
}

// Tokens
handlers.tokens = (data, cb) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete']
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, cb)
  } else {
    cb(405)
  }
}

// Tokens container
handlers._tokens = {
  /**
   * Tokens - post
   * Required data: phoneNumber, password
   * Optional data: none
   */
  post: (data, cb) => {
    const phoneNumber = typeof (data.payload.phoneNumber) === 'string' && data.payload.phoneNumber.trim().length === 10 ?
      data.payload.phoneNumber.trim() :
      false

    const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ?
      data.payload.password.trim() :
      false

    if (phoneNumber && password) {
      _data.read('users', phoneNumber, (err, userData) => {
        if (!err && userData) {
          const hashedPassword = helpers.hash(password)
          if (hashedPassword === userData.hashedPassword) {
            // If valid, creat a new token and set the experition time - 1 hour
            const tokenId = helpers.createRandomString(20)
            const expires = Date.now() + 1000 * 60 * 60
            const tokenObject = {
              'phoneNumber': phoneNumber,
              'id': tokenId,
              'expires': expires
            }

            // Store the token
            _data.create('tokens', tokenId, tokenObject, (err) => {
              if (!err) {
                cb(200, tokenObject)
              } else {
                cb(500, {
                  'Error': 'Could not create a new token'
                })
              }
            })
          } else {
            cb(400, {
              'Error': 'Wrong password or user.'
            })
          }
        } else {
          cb(400, {
            'Error': 'Could not find the specified user'
          })
        }
      })
    } else {
      cb(400, {
        'Error': 'Missing required field(s)'
      })
    }
  },

  /**
   * Tokens - get
   */
  get: (data, cb) => {
    // Check if the phone number is valid
    const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ?
      data.queryStringObject.id.trim() :
      false

    if (id) {
      // Look up the user
      _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
          // Remote the hash password
          delete tokenData.hashedPassword
          cb(200, tokenData)
        } else {
          cb(404)
        }
      })
    } else {
      cb(400, {
        'Eror': 'Missing required field'
      })
    }
  },

  /**
   * Tokens - put
   * Required data: id, extend
   * Optional data: none
   */
  put: (data, cb) => {
    const id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length === 20 ?
      data.payload.id.trim() :
      false

    const extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend === true ?
      true :
      false
    console.log(id, extend)
    if (id && extend) {
      // Look up the token
      _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
          // Check to make sure the token isn't already expired
          if (tokenData.expires > Date.now()) {
            // Set the experition an hour from now
            tokenData.expires = Date.now() + 1000 * 60 * 60

            _data.update('tokens', id, tokenData, (err) => {
              if (!err) {
                cb(200)
              } else {
                cb(500, {
                  'Error': 'Could not update the token\' expiration.'
                })
              }
            })
          } else {
            cb(400, {
              'Error': 'The token has already expired, and cannot be extended'
            })
          }
        } else {
          cb(400, {
            'Error': 'Specified token does not exist'
          })
        }
      })
    } else {
      cb(400, {
        'Error': 'Missing required field(s) or they\'re invalid '
      })
    }
  },

  /**
   * Tokens - delete
   * Required data - id
   * Optional data - none
   */
  delete: (data, cb) => {
    // Check if the id number is valid
    const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ?
      data.queryStringObject.id.trim() :
      false

    if (id) {
      // Look up the user
      _data.read('tokens', id, (err, data) => {
        if (!err && data) {
          _data.delete('tokens', id, (err) => {
            if (!err) {
              cb(200)
            } else {
              cb(500, {
                'Error': 'Could not delete the specified token'
              })
            }
          })
        } else {
          cb(400, {
            'Error': 'Could not find the specified token'
          })
        }
      })
    } else {
      cb(400, {
        'Eror': 'Missing required field'
      })
    }
  },

  verifyToken: (id, phoneNumber, cb) => {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check that the token is for the given user and has not expired
        if (tokenData.phoneNumber === phoneNumber && tokenData.expires > Date.now()) {
          cb(true)
        } else {
          cb(false)
        }
      } else {
        cb(false)
      }
    })
  }
}



module.exports = handlers