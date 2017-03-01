import Promise from 'broken'
import fs      from 'fs'
import request from 'request'

import XhrClient from './browser'

import {newError} from '../utils'

class NodeClient extends XhrClient
  constructor: (opts = {}) ->
    return new NodeClient opts unless @ instanceof NodeClient

    {@key, @debug} = opts

    if NodeClient.ENDPOINT
      @setEndpoint NodeClient.ENDPOINT

    if NodeClient.DEBUG
      @debug = true

    if opts.endpoint
      @setEndpoint opts.endpoint

  request: (blueprint, data = {}, key = @getKey()) ->
    opts =
      url:                 @getUrl blueprint.url, data, key
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

      if @debug
        console.log '--REQUEST--'
        console.log opts

      req = request opts, (err, res) =>
        if res?
          if @debug
            console.log '--RESPONSE--'
            console.log
              status: res.statusCode
              body:   res.body

          res.status = res.statusCode
          res.data   = res.body

        if err? or (res.status > 308) or res.data?.error?
          _err = newError opts, res, err
          if @debug
            console.log '--ERROR--'
            console.log
              message: _err.message
              status:  _err.status
              type:    _err.type
            console.log err.stack if err?
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
