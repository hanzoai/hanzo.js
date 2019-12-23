import Xhr from 'es-xhr-promise'

import Client     from './client'
import {newError, updateQuery} from '../utils'

class BrowserClient extends Client
  constructor: (opts) ->
    super opts

    return new BrowserClient opts unless @ instanceof BrowserClient

    @getCustomerToken()

  request: (blueprint, data={}, key = @getKey()) ->
    opts =
      url:    @url blueprint.url, data, key
      method: blueprint.method

    if blueprint.method != 'GET'
      opts.headers =
        'Content-Type': 'application/json'

    if blueprint.method == 'GET'
      opts.url  = updateQuery opts.url, data
    else
      opts.data = JSON.stringify data

    @log 'request', key: key, opts: opts

    (new Xhr).send opts
      .then (res) =>
        @log 'response', res
        res.data = res.responseText
        res
      .catch (res) =>
        try
          res.data = res.responseText ? (JSON.parse res.xhr.responseText)
        catch err

        err = newError data, res, err
        @log 'response', res
        @log 'error', err

        throw err

export default BrowserClient
