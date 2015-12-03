Xhr         = require 'xhr-promise-es6'
Xhr.Promise = require 'broken'


module.exports = class Client
  debug:    false
  endpoint: 'https://api.crowdstart.com'

  constructor: ({@key, @endpoint, @debug} = {}) ->
    return new Client @key unless @ instanceof Client

  setKey: (key) ->
    @key = key

  setUserKey: (key) ->
    @userKey = key

  getKey: ->
    @userKey or @key

  request: (url, data, method = 'POST', key = @getKey()) ->
    opts =
      url:    (@endpoint.replace /\/$/, '') + url + '?token=' + key
      method: method
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
