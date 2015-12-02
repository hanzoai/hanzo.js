global.Crowdstart ?= {}

Crowdstart.Api       = require './api'
Crowdstart.XhrClient = require './xhr-client'
Crowdstart.Client = (key) -> Crowdstart.Api Crowdstart.XhrClient key

module.exports = Crowdstart
