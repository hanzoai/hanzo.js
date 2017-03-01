import {isFunction, isString, newError, statusOk} from './utils'

class Api
  @BLUEPRINTS = {}
  @CLIENT     = null

  constructor: (opts = {}) ->
    return new Api opts unless @ instanceof Api

    {endpoint, debug, key, client, blueprints} = opts

    @debug      = debug
    blueprints ?= @constructor.BLUEPRINTS

    if client
      @client = client
    else
      @client = new @constructor.CLIENT
        debug:    debug
        endpoint: endpoint
        key:      key

    @addBlueprints k, v for k, v of blueprints

  addBlueprints: (api, blueprints) ->
    @[api] ?= {}

    for name, bp of blueprints
      do (name, bp) =>
        # Normal method
        if isFunction bp
          return @[api][name] = => bp.apply @, arguments

        # Blueprint method
        bp.expects ?= statusOk
        bp.method  ?= 'POST'  # Defaulting to POST shaves a few kb off browser bundle

        method = (data, cb) =>
          key = undefined
          if bp.useCustomerToken
            key = @client.getCustomerToken()
          @client.request bp, data, key
            .then (res) =>
              if res.data?.error?
                throw newError data, res
              unless bp.expects res
                throw newError data, res
              if bp.process?
                bp.process.call @, res
              res.data ? res.body
            .callback cb

        @[api][name] = method
    return

  setKey: (key) ->
    @client.setKey key

  setCustomerToken: (key) ->
    @client.setCustomerToken key

  deleteCustomerToken: ->
    @client.deleteCustomerToken()

  setStore: (id) ->
    @storeId = id
    @client.setStore id

export default Api
