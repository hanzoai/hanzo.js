Promise = require 'broken'
fs      = require 'fs'
request = require 'request'

XhrClient = require './xhr'

{newError} = require '../utils'

module.exports = class NodeClient extends XhrClient
  constructor: (opts = {}) ->
    return new NodeClient opts unless @ instanceof NodeClient

    {@key, @debug} = opts

    if NodeClient.ENDPOINT
      @setEndpoint NodeClient.ENDPOINT

    if NodeClient.DEBUG
      @debug = true

    if opts.endpoint
      @setEndpoint opts.endpoint

  request: (blueprint, data, key = @getKey()) ->
    opts =
      url:                @getUrl blueprint.url, data, key
      method:             blueprint.method
      headers:            blueprint.headers ? {}
      followAllRedirects: true

    if blueprint.stream? or blueprint.file?
      delete opts.json
    else
      if (['POST', 'PATCH', 'PUT'].indexOf opts.method) != -1
        opts.json = data
      else
        opts.json = true

    if blueprint.file?
      opts.body = fs.readFileSync blueprint.file data

    if @debug
      console.log '--REQUEST--'
      console.log opts

    new Promise (resolve, reject) =>
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
          err = newError opts, res
          if @debug
            console.log '--ERROR--'
            console.log
              message: err.message
              status:  err.status
              type:    err.type
          return reject err

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
