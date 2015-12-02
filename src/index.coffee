Api    = require './api'
Client = require './client'

# Set up API for server environment
Api.CLIENT     = Client
Api.BLUEPRINTS = require './blueprints/server'

wrapper =
  Api:    Api
  Client: Client

Object.defineProperties wrapper,
  blueprints: enumerable: true, get: -> require './blueprints'
  utils:      enumerable: true, get: -> require './utils'

module.exports = wrapper
