xhr = require 'xhr'

class Crowdstart
  endpoint: "https://api.crowdstart.com"
  constructor: (@key) ->

  setKey: (key) ->
    @key = key

  setStore: (id) ->
    @storeId = id

  req: (uri, data, cb) ->
    xhr
      uri: (@endpoint.replace /\/$/, '') + uri
      method: 'POST'
      headers:
        'Content-Type': 'application/json'
        'Authorization': @key
      json: data
    , (err, res, body) ->
      cb res.statusCode, body, res.headers.location

  login: (data, cb) ->
    uri = '/account/login'

    @req uri, data, cb

  create: (data, cb) ->
    uri = '/account/create'

    @req uri, data, cb

  authorize: (data, cb) ->
    uri = '/authorize'

    if @storeId?
      uri = "/store/#{@storeId}" + uri

    @req uri, data, cb

  charge: (data, cb) ->
    uri = '/charge'

    if @storeId?
      uri = "/store/#{@storeId}" + uri

    @req uri, data, cb

module.exports = Crowdstart
