global.Hanzo ?= {}

Api    = require './api'
Client = require './client/xhr'

Api.CLIENT     = Client
Api.BLUEPRINTS = require './blueprints/browser'

Hanzo.Api    = Api
Hanzo.Client = Client

module.exports = Hanzo
