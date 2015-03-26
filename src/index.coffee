xhr = require 'xhr'

class Crowdstart
  endpoint: "https://api.crowdstart.com"
  constructor: (@key) ->

  setKey: (key) ->
    @key = key

  req: (uri, payload, cb) ->
    xhr
      body: JSON.stringify payload
      uri:  @endpoint + uri
      headers:
        'Content-Type': 'application/json'
        'Authorization': @key
    , (err, res, body) ->
      cb status, JSON.parse body

  authorize: (data, cb) ->
    @req '/authorize', cb

  charge: (data, cb) ->
    @req '/charge', cb

unless typeof window is 'undefined'
  global = window

global.Crowdstart = (new Crowdstart)
