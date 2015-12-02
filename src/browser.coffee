global.Crowdstart ?= {}

Api    = require './api'
Client = require './client/xhr'

Api.CLIENT     = Client
Api.BLUEPRINTS = require './blueprints/browser'

Crowdstart.Api    = Api
Crowdstart.Client = Client

module.exports = Crowdstart
