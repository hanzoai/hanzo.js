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
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream

  req: (uri, data, method = 'POST', token = @key) ->
    opts =
      url: (@endpoint.replace /\/$/, '') + uri + '?token=' + token
      method: method
      # headers:
      #   'Content-Type': 'application/json'
      #   'Authorization': token
      data: JSON.stringify(data)

    if @debug
      console.log('REQUEST HEADER:', opts)

    p = shim.xhr opts
    p.then (res)=>
      return @lastResponse = res

    return p

  # USER/ACCOUNT
  user:
    # data =
    #     email:          ...
    exists: (data, success, fail) ->
      uri = '/account/exists/' + data.email

      return bindCbs @req(uri, {}), (res) ->
        return res.status == 200
      , success, fail

    # data =
    #     firstName:          ...
    #     lastName:           ...
    #     email:              ...
    #     password:           ...
    #     passwordConfirm:    ...
    create: (data, success, fail) ->
      uri = '/account/create'

      return bindCbs @req(uri, data), (res)->
        if res.status != 200
          throw new Error 'User Create Failed'
        return res
      , success, fail

    # data =
    #     tokenId:            ...
    createConfirm: (data, success, fail) ->
      uri = '/account/create/confirm/' + data.tokenId

      return bindCbs @req(uri, {}), (res)->
        if res.status != 200
          throw new Error 'User Create Confirmation Failed'
        return res
      , success, fail

    # data =
    #     email:      ...
    #     password:   ...
    login: (data, success, fail) ->
      uri = '/account/login'

      return bindCbs @req(uri, data), (res)=>
        if res.status != 200
          throw new Error 'User Login Failed'

        data = res.responseText
        @setToken data.token

        return res
      , success, fail

    logout: ()->
      @setToken ''

    # data =
    #     email:  ...
    reset: (data, success, fail) ->
      uri = '/account/reset?email=' + data.email

      return bindCbs @req(uri, data, 'GET'), (res)->
        if res.status != 200
          throw new Error 'Password Reset Failed'

        return res
      , success, fail

    # data =
    #     tokenId:            ...
    #     password:           ...
    #     passwordConfirm:    ...
    resetConfirm: (data, success, fail) ->
      uri = '/account/reset/confirm/' + data.tokenId

      return bindCbs @req(uri, data), (res)->
        if res.status != 200
          throw new Error 'Password Reset Confirmation Failed'

        return res
      , success, fail

    # no data required
    account: (success, fail) ->
      uri = '/account'

      return bindCbs @req(uri, {}, 'GET', @getToken()), (res)->
        if res.status != 200
          throw new Error 'Account Retrieval Failed'

        return res
      , success, fail

    # data should be a user object
    updateAccount: (data, success, fail) ->
      uri = '/account'

      return bindCbs @req(uri, data, 'PATCH', @getToken()), (res)->
        if res.status != 200
          throw new Error 'Account Update Failed'

        return res
      , success, fail

  # PAYMENT
  payment:
    # data =
    #     user:     user object
    #     order:    order object
    #     payment:  payment object
    authorize: (data, success, fail) ->
      uri = '/authorize'

      if @storeId?
        uri = "/store/#{@storeId}" + uri

      return bindCbs @req(uri, data), (res)->
        if res.status != 200
          throw new Error 'Payment Authorization Failed'

        return res
      , success, fail

    # data =
    #     orderId:  order id of existing order
    capture: (data, success, fail) ->
      uri = '/capture/' + data.orderId

      if @storeId?
        uri = "/store/#{@storeId}" + uri

      return bindCbs @req(uri, {}), (res) ->
        if res.status != 200
          throw new Error 'Payment Capture Failed'

        return res
      , success, fail

    charge: (data, success, fail) ->
      uri = '/charge'

      if @storeId?
        uri = "/store/#{@storeId}" + uri

      return bindCbs @req(uri, data), (res) ->
        if res.status != 200
          throw new Error 'Payment Charge Failed'

        return res
      , success, fail

    paypal: (data, success, fail) ->
      uri = '/paypal/pay'

      if @storeId?
        uri = "/store/#{@storeId}" + uri

      return bindCbs @req(uri, data), (res) ->
        if res.status != 200
          throw new Error 'Get Paypal PayKey Failed'

        return res
      , success, fail

    # data =
    #     userId:   id of user
    #     orderId:  id of order
    #     program:  program object
    newReferrer: (data, success, fail) ->
      uri = '/referrer'

      return bindCbs @req(uri, data, 'POST'), (res)->
        if res.status != 201
          throw new Error 'Referrer Creation Failed'

        return res
      , success, fail

  # UTILITY
  util:
    product: (productId, success, fail) ->
      uri = '/product/' + productId

      if @storeId?
        uri = "/store/#{@storeId}" + uri

      return bindCbs @req(uri, {}, 'GET'), (res) ->
        if res.status != 200
          throw new Error 'Get Product Failed'

        return res
      , success, fail

    coupon: (code, success, fail) ->
      uri = '/coupon/' + code

      if @storeId?
        uri = "/store/#{@storeId}" + uri

      return bindCbs @req(uri, {}, 'GET'), (res) ->
        if res.status != 200
          throw new Error 'Get Coupon Failed'

        return res
      , success, fail
