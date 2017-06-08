import Promise from 'broken'
import request from 'request'
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

      # Enable proxy for automatically generating documentation
      # proxy:               'http://localhost:4010'
      # tunnel:              true
      # strictSSL:           false

    # Get body from previous step
    if data.body?
      opts.body = data.body

    # Not JSON if blueprint.file or blueprint.stream is set
    if blueprint.stream? or blueprint.file?
      delete opts.json
    else
      if (['POST', 'PATCH', 'PUT'].indexOf opts.method) != -1
        opts.json = data
      else
        opts.json = true

    @log 'request', opts, 'key', key

    new Promise (resolve, reject) =>

      # Read file is requested
      if blueprint.file? and (not data.body?)
        fs.readFile (blueprint.file data), (err, body) =>
          return reject err if err?

          data.body = body

          (@request blueprint, data, key)
            .then resolve
            .catch reject
        return

      req = request opts, (err, res) =>
        if res?
          @log 'response', res.statusCode, res.body

          res.status = res.statusCode
          res.data   = res.body

        if err? or (res.status > 308) or res.data?.error?
          _err = newError opts, res, err
          @log 'error', _err.type, _err.status, _err.message
          @log err.stack if err?
          return reject _err

        resolve
          url:          opts.url
          req:          opts
          res:          res
          data:         res.data
          responseText: res.data
          status:       res.status
          statusText:   res.statusText
          headers:      res.headers

      if blueprint.stream?
        (blueprint.stream.call @, data).pipe req

export default NodeClient
