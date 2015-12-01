Client  = require './client'
api     = require './api'
cookies = require 'cookies-js'

sessionTokenName = 'crowdstart-session'
cachedToken      = ''


module.exports = class Crowdstart
  constructor: (@key) ->
    @client = new Client @key
    for k, v of api
      addApi k, v

  addApi: (api, blueprints) ->
    for name, blueprint of blueprints
      do (name, blueprint) ->
        # Just a normal method
        if isFunction blueprint
          @[api][name] = -> blueprint.apply @, arguments
          return

        # Request blueprint...

        # Setup uri builder
        if typeof blueprint.uri is 'string'
          mkuri = (res) -> blueprint.uri
        else
          mkuri = blueprint.uri

        {expects, method, process} = blueprint

        @[api][name] = (data, cb) =>
          uri = mkuri.call @, data
          @client.request uri, data, method
            .then (res) ->
              if res.error?
                return newError data, res
              unless expects res
                return newError data, res
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
    @client.key = key

  setStore: (id) ->
    @storeId = id
