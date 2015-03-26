xhr = require 'xhr'

class Crowdstart
  endpoint: "https://api.crowdstart.com"
  constructor: (@key) ->

  setKey: (key) ->
    @key = key

  req: (uri, payload, cb) ->
    xhr
      body: JSON.stringify payload
      uri:  @endpoint.trimRight '/' + '/' + uri.trimLeft '/'
      headers:
        'Content-Type': 'application/json'
        'Authorization': @key
    , (err, res, body) ->
      cb status, JSON.parse body

  authorize: (data, cb) ->
    @req '/authorize', cb

  charge: (data, cb) ->
    @req '/charge', cb

if typeof window isnt 'undefined'
  window.Crowdstart = new Crowdstart()


module.exports = Crowdstart
