const environments = {}

// Staging (defaul enviroment)
environments.stage = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'asudha8sdg7asd807agd87agd87gas78d'
}

// Prod environments
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'ma0sjd90a8sdtas76d87g231fv23'
}

const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ?
  process.env.NODE_ENV.toLowerCase() :
  ''

const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ?
  environments[currentEnvironment] :
  environments.stage

module.exports = environmentToExport