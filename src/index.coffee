xhr = require 'xhr'

class Crowdstart
  constructor: (@key) ->

  setKey: (key) ->
    @key = key

  req: (url, payload, cb) ->
    xhr
      body: JSON.stringify payload,
      uri:  url
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
