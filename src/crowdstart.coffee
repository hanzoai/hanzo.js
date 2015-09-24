shim    = require './shim'
cookies = require 'cookies-js'

sessionTokenName = 'crowdstart-session'

cachedToken = ''

class Client
  debug: false
  endpoint: "https://api.crowdstart.com"
  lastResponse: null
  constructor: (@key) ->

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

  # data =
  #     firstName:          ...
  #     lastName:           ...
  #     email:              ...
  #     password:           ...
  #     passwordConfirm:    ...
  create: (data, cb) ->
    uri = '/account/create'

    p = @req uri, data
    return p.then (res)->
      if res.status != 200
        throw new Error 'User Create Failed'

      return res

  # data =
  #     tokenId:            ...
  createConfirm: (data)->
    uri = '/account/create/confirm/' + data.tokenId

    p = @req uri, data
    return p.then (res) =>
      if res.status != 200
        throw new Error 'User Create Confirmation Failed'

      return res

  # data =
  #     email:      ...
  #     password:   ...
  login: (data) ->
    uri = '/account/login'

    p = @req uri, data
    return p.then (res) =>
      if res.status != 200
        throw new Error 'User Login Failed'

      data = res.responseText
      @setToken data.token

      return res

  # data =
  #     email:  ...
  reset: (data)->
    uri = '/account/reset?email=' + data.email

    p = @req uri, data, 'GET'
    return p.then (res) =>
      if res.status != 200
        throw new Error 'Password Reset Failed'

      return res

  # data =
  #     tokenId:            ...
  #     password:           ...
  #     passwordConfirm:    ...
  resetConfirm: (data)->
    uri = '/account/reset/confirm/' + data.tokenId

    p = @req uri, data
    return p.then (res) =>
      if res.status != 200
        throw new Error 'Password Reset Confirmation Failed'

      return res

  # data is optional
  #
  # data = null means you are firing a get request
  # data != null means you are firing a patch request
  #
  # data should be a user object
  account: (data)->
    uri = '/account'

    if data?
      p = @req uri, data, 'PATCH', @getToken()
      return p.then (res) ->
        if res.status != 200
          console.error res
          throw new Error 'Account Update Failed'

        return res
    else
      p = @req uri, data, 'GET', @getToken()
      return p.then (res) ->
        if res.status != 200
          throw new Error 'Account Retrieval Failed'

        return res

  # data =
  #     userid:            ...
  #     program:           ...
  newReferrer: (data)->
    uri = '/referrer'

    p = @req uri, data
    return p.then (res) =>
      if res.status != 200
        throw new Error 'Referrer Creation Failed'

      return res

  # PAYMENT
  authorize: (data, cb) ->
    uri = '/authorize'

    if @storeId?
      uri = "/store/#{@storeId}" + uri

    return @req uri, data

  charge: (data, cb) ->
    uri = '/charge'

    if @storeId?
      uri = "/store/#{@storeId}" + uri

    return @req uri, data

module.exports = Client
