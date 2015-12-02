Xhr         = require 'xhr-promise-es6'
Xhr.Promise = require 'broken'


module.exports = class Client
  debug:    false
  endpoint: 'https://api.crowdstart.com'

  constructor: ({@key, @endpoint, @debug} = {}) ->
    return new Client @key unless @ instanceof Client

  setKey: (key) ->
    @key = key

  request: (uri, data, method = 'POST', token = @key) ->
    opts =
      url: (@endpoint.replace /\/$/, '') + uri + '?token=' + token
      method: method
      # headers:
      #   'Content-Type': 'application/json'
      #   'Authorization': token
      data: JSON.stringify data

    if @debug
      console.log('REQUEST HEADER:', opts)

    (new Xhr).send opts
      .then (res) ->
        res.data = res.responseText
        res
      .catch (res) ->
        res.data = res.responseText
        throw newError data, res
