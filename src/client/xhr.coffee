Xhr         = require 'xhr-promise-es6'
Xhr.Promise = require 'broken'

{isFunction, newError} = require '../utils'

module.exports = class XhrClient
  debug:    false
  endpoint: 'https://api.crowdstart.com'

  constructor: (opts = {}) ->
    {@key, @debug} = opts
    @setEndpoint opts.endpoint

  setEndpoint: (endpoint = '') ->
    @endpoint = endpoint.replace /\/$/, ''

  setKey: (key) ->
    @key = key

  setUserKey: (key) ->
    @userKey = key

  getKey: ->
    @userKey or @key or @constructor.KEY

  getUrl: (url, data, key) ->
    if isFunction url
      url = url.call @, data

    "#{@endpoint}#{url}?token=#{key}"

  request: (blueprint, data, key = @getKey()) ->
    opts =
      url:    @getUrl blueprint.url, data, key
      method: blueprint.method
      data:   JSON.stringify data

    if @debug
      console.log '--REQUEST--'
      console.log opts

    (new Xhr).send opts
      .then (res) ->
        if @debug
          console.log '--RESPONSE--'
          console.log res

        res.data   = res.responseText
        res
      .catch (res) ->
        try
          res.data   = res.responseText ? (JSON.parse res.xhr.responseText)
        catch err

        err = newError data, res
        if @debug
          console.log '--RESPONSE--'
          console.log res
          console.log 'ERROR:', err

        throw err
