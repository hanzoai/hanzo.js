cookie = require 'js-cookie'

{isFunction, newError, statusOk} = require './utils'

module.exports = class Api
  @SESSION_NAME = 'crowdstart-session'
  @BLUEPRINTS   = {}
  @CLIENT       = ->

  constructor: (opts = {}) ->
    return new Api arguments... unless @ instanceof Api

    {endpoint, debug, key, client, blueprints} = opts

    @debug      = debug
    blueprints ?= Api.BLUEPRINTS

    if client
      @client = client
    else
      @client = new Api.CLIENT
        debug:    debug
        endpoint: endpoint
        key:      key

    @addBlueprints k, v for k, v of blueprints

  addBlueprints: (api, blueprints) ->
    @[api] ?= {}

    for name, blueprint of blueprints
      do (name, blueprint) =>
        # Just a normal method
        if isFunction blueprint
          @[api][name] = => blueprint.apply @, arguments
          return

        # Request blueprint...

        # Setup url builder
        if typeof blueprint.url is 'string'
          mkurl = (res) -> blueprint.url
        else
          mkurl = blueprint.url

        {expects, method, process} = blueprint

        # Blueprint defaults
        expects ?= statusOk
        method  ?= 'POST'  # Defaulting to POST shaves a few kb off browser bundle

        @[api][name] = (data, cb) =>
          url = mkurl.call @, data
          @client.request url, data, method
            .then (res) =>
              if res.data?.error?
                throw newError data, res
              unless expects res
                throw newError data, res
              if process?
                process.call @, res
              res
            .callback cb
        return
    return

  setKey: (key) ->
    @client.setKey key

  setUserKey: (key) ->
    cookie.set Api.SESSION_NAME, key, expires: 604800
    @client.setUserKey key

  getUserKey: ->
    cookie.get Api.SESSION_NAME

  setStore: (id) ->
    @storeId = id
