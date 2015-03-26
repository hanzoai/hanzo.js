xhr = require 'xhr'

class Crowdstart
  endpoint: "https://api.crowdstart.com"
  constructor: (@key) ->

  setKey: (key) ->
    @key = key

  req: (uri, data, cb) ->
    xhr
      uri:  (@endpoint.replace /\/$/, '') + uri
      method: 'POST'
      headers:
        'Content-Type': 'application/json'
        'Authorization': @key
      json: data
    , (err, res, body) ->
      cb res.statusCode, body, res.headers.location

  authorize: (data, cb) ->
    @req '/authorize', data, cb

  charge: (data, cb) ->
    @req '/charge', data, cb

module.exports = Crowdstart
