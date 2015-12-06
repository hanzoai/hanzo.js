Api    = require './api'
Client = require './client'

# Set up API for server environment
Api.CLIENT     = Client
Api.BLUEPRINTS = require './blueprints/server'

Client.KEY      = process.env.CROWDSTART_KEY
Client.ENDPOINT = process.env.CROWDSTART_ENDPOINT
Client.DEBUG    = process.env.CROWDSTART_DEBUG

module.exports = Api
