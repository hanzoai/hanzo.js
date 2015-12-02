methods = require './methods'
cookies = require 'cookies-js'

{isFunction, newError, statusOk} = require './utils'

sessionTokenName = 'crowdstart-session'
cachedToken      = ''


module.exports = class Api
  constructor: ({@endpoint, @debug, @key, @client} = {}) ->
    return new Api arguments... unless @ instanceof Api

    unless @client
      @client = new (require './xhr-client')
        key:      @key
        debug:    @debug
        endpoint: @endpoint

    for api, blueprints of methods
      @addBlueprints api, blueprints

  addBlueprints: (api, blueprints) ->
    @[api] ?= {}

    for name, blueprint of blueprints
      do (name, blueprint) =>
        # Just a normal method
        if isFunction blueprint
          @[api][name] = => blueprint.apply @, arguments
          return

        # Request blueprint...

        # Setup uri builder
        if typeof blueprint.uri is 'string'
          mkuri = (res) -> blueprint.uri
        else
          mkuri = blueprint.uri

        {expects, method, process} = blueprint

        expects ?= statusOk
        method  ?= 'POST'

        @[api][name] = (data, cb) =>
          uri = mkuri.call @, data
          @client.request uri, data, method
            .then (res) =>
              if res.data?.error?
                throw newError data, res
              unless expects res
                throw newError data, res
              if process?
                process.call @, res
              res
            .callback cb

  setToken: (token) ->
    if window.location.protocol == 'file:'
      return cachedToken = token

    cookies.set sessionTokenName, token, expires: 604800

  getToken: ->
    if window.location.protocol == 'file:'
      return cachedToken

    return (cookies.get sessionTokenName) ? ''

  setKey: (key) ->
    @client.setKey key

  setStore: (id) ->
    @storeId = id
