Api    = require './api'
Client = require './client'

# Set up API for server environment
Api.CLIENT     = Client
Api.BLUEPRINTS = require './blueprints/server'

Client.KEY      = process.env.HANZO_KEY
Client.ENDPOINT = process.env.HANZO_ENDPOINT
Client.DEBUG    = process.env.HANZO_DEBUG

module.exports = Api
