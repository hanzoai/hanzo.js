Api    = require './api'
Client = require './client'

# Set up API for server environment
Api.CLIENT     = Client
Api.BLUEPRINTS = require './blueprints/server'

module.exports = Api
