const environments = {}

// Staging (defaul enviroment)
environments.stage = {
  'port': 3000,
  'envName': 'staging'
}

// Prod environments
environments.production = {
  'port': 5000,
  'envName': 'production'
}

const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ?
  process.env.NODE_ENV.toLowerCase() :
  ''

const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ?
  environments[currentEnvironment] :
  environments.stage

module.exports = environmentToExport