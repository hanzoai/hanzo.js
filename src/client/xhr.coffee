Xhr         = require 'xhr-promise-es6'
Xhr.Promise = require 'broken'

cookie = require 'js-cookie'

{isFunction, newError, updateQuery} = require '../utils'

module.exports = class XhrClient
  debug:       false
  endpoint:    'https://api.crowdstart.com'
  sessionName: 'crwdst'

  constructor: (opts = {}) ->
    return new XhrClient opts unless @ instanceof XhrClient

    {@key, @debug} = opts

    if opts.endpoint
      @setEndpoint opts.endpoint

    @getUserKey()

  setEndpoint: (endpoint) ->
    @endpoint = endpoint.replace /\/$/, ''

  setStore: (id) ->
    @storeId = id

  setKey: (key) ->
    @key = key

  getKey: ->
    @userKey or @key or @constructor.KEY

  getUserKey: ->
    if (session = cookie.getJSON @sessionName)?
      @userKey = session.userKey if session.userKey?
    @userKey

  setUserKey: (key) ->
    cookie.set @sessionName, {userKey: key}, expires: 7 * 24 * 3600 * 1000
    @userKey = key

  deleteUserKey: ->
    cookie.set @sessionName, {userKey: null}, expires: 7 * 24 * 3600 * 1000
    @userKey

  getUrl: (url, data, key) ->
    if isFunction url
      url = url.call @, data

    updateQuery (@endpoint + url), 'token', key

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
