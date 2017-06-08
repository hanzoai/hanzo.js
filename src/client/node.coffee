import Promise from 'broken'
import axios   from 'axios'
import fs      from 'fs'

import Client from './client'

import {newError} from '../utils'

KEY      = process.env.HANZO_KEY
ENDPOINT = process.env.HANZO_ENDPOINT
DEBUG    = process.env.HANZO_DEBUG

class NodeClient extends Client
  constructor: (opts) ->
    return new NodeClient opts unless @ instanceof NodeClient
    super opts

    @opts.endpoint = ENDPOINT if ENDPOINT
    @opts.debug    = true if DEBUG
    @setKey KEY if KEY

  request: (blueprint, data = {}, key = @getKey()) ->
    opts =
      url:                 @url blueprint.url, data, key
      method:              blueprint.method
      headers:             blueprint.headers ? {}
      followAllRedirects:  true
      validateStatus:      (status) -> status < 308
      data:                data

    @log 'request', opts, 'key', key

    new Promise (resolve, reject) =>
      axios opts
        .then (res) =>
          @log 'response', res.status

          resolve
            url:          opts.url
            req:          opts
            res:          res
            data:         res.data
            responseText: res.data
            status:       res.status
            statusText:   res.statusText
            headers:      res.headers
        .catch (err) =>
          _err = newError opts, err.response, err
          @log 'error', _err.type, _err.status, _err.message
          @log err.stack if err?
          return reject _err


export default NodeClient
