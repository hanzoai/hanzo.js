shim    = require './shim'
cookies = require 'cookies-js'

sessionTokenName = 'crowdstart-session'

cachedToken = ''

bindCbs = (p, predicate, success, fail)->
  p = p.then predicate
  p = p.then(success) if success?
  p = p.catch(fail)   if fail?
  return p


class Client
  debug: false
  endpoint: "https://api.crowdstart.com"
  lastResponse: null
  constructor: (@key) ->
    user = {}
    for name, fn of @user
      user[name] = fn.bind(@)

    @user = user

    payment = {}
    for name, fn of @payment
      payment[name] = fn.bind(@)

    @payment = payment

    util = {}
    for name, fn of @util
      util[name] = fn.bind(@)

    @util = util

  setToken: (token)->
    if window.location.protocol == 'file:'
      cachedToken = token
      return

    cookies.set sessionTokenName, token, expires: 604800

  getToken: ()->
    if window.location.protocol == 'file:'
      return cachedToken

    return (cookies.get sessionTokenName) ? ''

  setKey: (key) ->
    @key = key

  setStore: (id) ->
    @storeId = id

  req: (uri, data, method = 'POST', token = @key) ->
    opts =
      url: (@endpoint.replace /\/$/, '') + uri
      method: method
      headers:
        'Content-Type': 'application/json'
        'Authorization': token
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

      return bindCbs @req(uri, {}), (res)->
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

    # data =
    #     userId:   id of user
    #     orderId:  id of order
    #     program:  program object
    newReferrer: (data, success, fail) ->
      uri = '/referrer'

      return bindCbs @req(uri, data, 'GET', @getToken()), (res)->
        if res.status != 201
          throw new Error 'Referrer Creation Failed'

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

module.exports = Client
