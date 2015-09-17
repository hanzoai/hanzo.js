shim    = require './shim'
cookies = require 'cookies-js'

sessionTokenName = 'crowdstart-session'

class Crowdstart
  endpoint: "https://api.crowdstart.com"
  lastResponse: null
  constructor: (@key) ->

  setToken: (token)->
    cookies.set sessionTokenName, token, expires: 604800

  getToken: ()->
    cookies.get sessionTokenName

  setKey: (key) ->
    @key = key

  setStore: (id) ->
    @storeId = id

  req: (uri, data, method = 'POST') ->
    opts =
      url: (@endpoint.replace /\/$/, '') + uri
      method: method
      headers:
        'Content-Type': 'application/json'
        'Authorization': @key
      data: JSON.stringify(data)

    p = shim.xhr opts
    p.then (res)=>
      return @lastResponse = res

    p.catch (err)->
      console.log err
      return err

    return p

  # data =
  #     email: ...
  #     password: ...
  login: (data) ->
    uri = '/account/login'

    p = @req uri, data
    p.then (res)=>
      if res.status != 200
        throw new Error('Login Failed')

      data = res.responseText
      @setToken data.token

      return res

  # data =
  #     email: ...
  reset: (data)->
    uri = '/account/reset?email=' + data.email

    return @req uri, data, 'GET'

  create: (data, cb) ->
    uri = '/account/create'

    return @req uri, data

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

module.exports = Crowdstart
