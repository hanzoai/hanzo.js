import Xhr     from 'xhr-promise-es6'
import Promise from 'broken'
import cookie  from 'js-cookie'

import {isFunction, newError, updateQuery} from '../utils'

Xhr.Promise = Promise

class XhrClient
  debug:       false
  endpoint:    'https://api.hanzo.io'
  sessionName: 'hnzo'

  constructor: (opts = {}) ->
    return new XhrClient opts unless @ instanceof XhrClient

    {@key, @debug} = opts

    if opts.endpoint
      @setEndpoint opts.endpoint

    @getCustomerToken()

  setEndpoint: (endpoint) ->
    @endpoint = endpoint.replace /\/$/, ''

  setStore: (id) ->
    @storeId = id

  setKey: (key) ->
    @key = key

  getKey: ->
    @key or @constructor.KEY

  getCustomerToken: ->
    if (session = cookie.getJSON @sessionName)?
      @customerToken = session.customerToken if session.customerToken?
    @customerToken

  setCustomerToken: (key) ->
    cookie.set @sessionName, {customerToken: key}, expires: 7 * 24 * 3600 * 1000
    @customerToken = key

  deleteCustomerToken: ->
    cookie.set @sessionName, {customerToken: null}, expires: 7 * 24 * 3600 * 1000
    @customerToken = null

  getUrl: (url, data, key) ->
    if isFunction url
      url = url.call @, data

    updateQuery (@endpoint + url), token: key

  request: (blueprint, data={}, key = @getKey()) ->
    opts =
      url:    @getUrl blueprint.url, data, key
      method: blueprint.method

    if blueprint.method != 'GET'
      opts.headers =
        'Content-Type': 'application/json'

    if blueprint.method == 'GET'
      opts.url  = updateQuery opts.url, data
    else
      opts.data = JSON.stringify data

    if @debug
      console.log '--KEY--'
      console.log key
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

export default XhrClient
