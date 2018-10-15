const environments = {}

// Staging (defaul enviroment)
environments.stage = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging'
}

// Prod environments
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production'
}

const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ?
  process.env.NODE_ENV.toLowerCase() :
  ''

const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ?
  environments[currentEnvironment] :
  environments.stage

module.exports = environmentToExport