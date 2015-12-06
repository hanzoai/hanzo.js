Api    = require './api'
Client = require './client'

# Set up API for server environment
Api.CLIENT     = Client
Api.BLUEPRINTS = require './blueprints/server'

Client.KEY      = process.env.CROWDSTART_KEY
Client.ENDPOINT = process.env.CROWDSTART_ENDPOINT

module.exports = Api
