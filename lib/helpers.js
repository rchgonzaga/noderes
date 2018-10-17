/**
 * 
 * Helper for various tasks
 * 
 */

// Dependencies
const crypto = require('crypto')
const config = require('../config')

// Container for all the helpers
const helpers = {

  // SHA256
  hash: (str) => {
    if (typeof (str) === 'string' && str.length > 0) {
      const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
      return hash
    } else {
      return false
    }
  },

  // ParseJsonToObject
  parseJsonToObject: (str) => {
    try {
      const obj = JSON.parse(str)
      return obj
    } catch (e) {
      return {}
    }
  },

  // randon string
  createRandomString: (strLength) => {
    strLength = typeof (strLength) === 'number' && strLength > 0 ?
      strLength :
      false
    if (strLength) {
      // Define
      const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'
      let str = ''
      for (let i = 1; i < strLength; i++) {
        const randomCharacters = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
        str += randomCharacters
      }

      return str
    } else {
      return false
    }
  }

}

// Export the module
module.exports = helpers