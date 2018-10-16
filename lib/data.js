/**
 *  Lib to store data
 */

// Dependencies
const fs = require('fs')
const path = require('path')

const lib = {

  baseDir: path.join(__dirname, '/../tmp/.data/'),

  create: (dir, file, data, cb) => {
    // Open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (error, fileDescriptor) => {
      if (!error && fileDescriptor) {
        // convert data to string
        const stringData = JSON.stringify(data)

        // Write to a file and close it
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                cb(false)
              } else {
                cb('Error closing new file.')
              }
            })
          } else {
            cb('Error writing to new file.')
          }
        })
      } else {
        cb('Could not open the file, it may not exist.')
      }
    })
  },

  read: (dir, file, cb) => {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
      cb(err, data)
    })
  },

  update: (dir, file, data, cb) => {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
      if (!error && fileDescriptor) {
        const stringData = JSON.stringify(data)

        //truncate
        fs.truncate(fileDescriptor, (err) => {
          if (!err) {
            // Write to the file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    cb(false)
                  } else {
                    cb('Error closing existing file')
                  }
                })
              } else {
                cb('Error writing to existing file')
              }
            })
          } else {
            cb('Error truncation file')
          }
        })
      } else {
        cb('Could not open the file for updating, it may not exist')
      }
    })
  }
}

module.exports = lib