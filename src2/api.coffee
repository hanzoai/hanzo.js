import isFunction from 'es-is/function'
import isString   from 'es-is/string'

import {GET, newError, statusOk} from './utils'

class Api
  @BLUEPRINTS = {}
  @CLIENT     = null

  constructor: (opts = {}) ->
    return new Api opts unless @ instanceof Api

    {blueprints, client} = opts

    @client = client or new @constructor.CLIENT opts

    blueprints ?= @constructor.BLUEPRINTS
    @addBlueprints k, v for k, v of blueprints

  addBlueprints: (api, blueprints) ->
    @[api] ?= {}
    for name, bp of blueprints
      @addBlueprint api, name, bp
    return

  addBlueprint: (api, name, bp) ->
    # Normal method
    if isFunction bp
      return @[api][name] = => bp.apply @, arguments

    # Blueprint method
    bp.expects ?= statusOk
    bp.method  ?= GET

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

  setKey: (key) ->
    @client.setKey key

  setCustomerToken: (key) ->
    @client.setCustomerToken key

  getCustomerToken: () ->
    @client.getCustomerToken()

  deleteCustomerToken: ->
    @client.deleteCustomerToken()

  setStore: (id) ->
    @storeId = id
    @client.setStore id

export default Api
